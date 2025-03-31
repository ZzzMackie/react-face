import * as THREE from 'three';

import { TGALoader } from 'three/addons/loaders/TGALoader.js';

import { getFilesFromItemList, createFilesMap } from './LoaderUtils.js';

import { unzipSync, strFromU8 } from 'three/addons/libs/fflate.module.js';

async function handleJSON({ scope, data, modelData, onSuccess, file, extension, filename }) {
  if (data.metadata === undefined) {
    // 2.0

    data.metadata = { type: 'Geometry' };
  }

  if (data.metadata.type === undefined) {
    // 3.0

    data.metadata.type = 'Geometry';
  }

  if (data.metadata.formatVersion !== undefined) {
    data.metadata.version = data.metadata.formatVersion;
  }
  switch (data.metadata.type.toLowerCase()) {
    case 'buffergeometry': {
      const loader = new THREE.BufferGeometryLoader();
      const result = loader.parse(data);

      const mesh = new THREE.Mesh(result);
      await onSuccess({ object: mesh, data: modelData, file, extension, filename });

      break;
    }

    case 'geometry':
      console.error('Loader: "Geometry" is no longer supported.');

      break;

    case 'object': {
      await scope.threeEngine.addModelObject({ data });
      break;
    }

    case 'app':
      //   editor.fromJSON(data);
      await scope.threeEngine.addModelObject({ data: data.scene });
      break;
  }
}

// eslint-disable-next-line no-unused-vars
async function handleZIP({ scope, contents, modelData, onSuccess, file, extension, filename }) {
  const zip = unzipSync(new Uint8Array(contents));

  // Poly

  if (zip['model.obj'] && zip['materials.mtl']) {
    const { MTLLoader } = await import('three/addons/loaders/MTLLoader.js');
    const { OBJLoader } = await import('three/addons/loaders/OBJLoader.js');
    const materials = new MTLLoader().parse(strFromU8(zip['materials.mtl']));
    const object = new OBJLoader().setMaterials(materials).parse(strFromU8(zip['model.obj']));
    // editor.execute(new AddObjectCommand(editor, object));
    onSuccess({ object, data: modelData, file, extension, filename });
  }

  //

  for (const path in zip) {
    const file = zip[path];

    const manager = new THREE.LoadingManager();
    manager.setURLModifier(function (url) {
      const file = zip[url];

      if (file) {
        console.log('Loading', url);

        const blob = new Blob([file.buffer], { type: 'application/octet-stream' });
        return URL.createObjectURL(blob);
      }

      return url;
    });

    const extension = path.split('.').pop().toLowerCase();

    switch (extension) {
      case 'fbx': {
        const { FBXLoader } = await import('three/addons/loaders/FBXLoader.js');

        const loader = new FBXLoader(manager);
        const object = loader.parse(file.buffer);
        await onSuccess({ object, data: modelData, file, extension, filename });
        // editor.execute(new AddObjectCommand(editor, object));

        break;
      }

      case 'glb': {
        const loader = await createGLTFLoader();

        loader.parse(file.buffer, '', async function (result) {
          const scene = result.scene;

          scene.animations.push(...result.animations);
          await onSuccess(scene, modelData);
          //   editor.execute(new AddObjectCommand(editor, scene));

          loader.dracoLoader.dispose();
          loader.ktx2Loader.dispose();
        });

        break;
      }

      case 'gltf': {
        const loader = await createGLTFLoader(manager);

        loader.parse(strFromU8(file), '', async function (result) {
          const scene = result.scene;

          scene.animations.push(...result.animations);
          await onSuccess(scene, modelData);
          //   editor.execute(new AddObjectCommand(editor, scene));

          loader.dracoLoader.dispose();
          loader.ktx2Loader.dispose();
        });

        break;
      }
    }
  }
}

async function createGLTFLoader(manager) {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');
  const { KTX2Loader } = await import('three/addons/loaders/KTX2Loader.js');
  const { MeshoptDecoder } = await import('three/addons/libs/meshopt_decoder.module.js');

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('three/examples/jsm/libs/draco/gltf/');

  const ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath('three/examples/jsm/libs/basis/');

  // editor.signals.rendererDetectKTX2Support.dispatch(ktx2Loader);

  const loader = new GLTFLoader(manager);
  loader.setDRACOLoader(dracoLoader);
  loader.setKTX2Loader(ktx2Loader);
  loader.setMeshoptDecoder(MeshoptDecoder);

  return loader;
}
class Loader {
  constructor(threeEngine) {
    this.threeEngine = threeEngine;
    this.texturePath = '';
  }

  loadItemList(items) {
    getFilesFromItemList(items, (files, filesMap) => {
      this.loadFiles({ files, filesMap });
    });
  }

  async loadFiles({ files, filesMap, modelData, onSuccess }) {
    if (files.length > 0) {
      filesMap = filesMap || createFilesMap(files);

      const manager = new THREE.LoadingManager();
      const allFilePromise = [];
      manager.setURLModifier(function (url) {
        url = url.replace(/^(\.?\/)/, ''); // remove './'

        const file = filesMap[url];

        if (file) {
          console.log('Loading', url);

          return URL.createObjectURL(file);
        }

        return url;
      });

      manager.addHandler(/\.tga$/i, new TGALoader());

      for (let i = 0; i < files.length; i++) {
        allFilePromise.push(this.loadFile({ file: files[i], manager, modelData, onSuccess }));
      }
      return await Promise.allSettled(allFilePromise);
    }
    return await Promise.resolve();
  }

  loadFile({
    file,
    manager,
    modelData,
    onSuccess = async (...args) => {
      await this.threeEngine.addObjectGroup(...args);
    }
  }) {
    return new Promise((resolve, reject) => {
      const scope = this;
      const filename = file.name;
      const extension = filename.split('.').pop().toLowerCase();

      const reader = new FileReader();
      reader.addEventListener('progress', function (event) {
        const size = '(' + Math.floor(event.total / 1000)?.format?.() + ' KB)';
        const progress = Math.floor((event.loaded / event.total) * 100) + '%';

        console.log('Loading', filename, size, progress);
      });

      switch (extension) {
        case '3dm': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              const { Rhino3dmLoader } = await import('three/addons/loaders/3DMLoader.js');

              const loader = new Rhino3dmLoader();
              loader.setLibraryPath('three/examples/jsm/libs/rhino3dm/');
              loader.parse(
                contents,
                async function (object) {
                  object.name = filename;

                  await onSuccess({ object, data: modelData, file, extension, filename });
                  resolve({ object, data: modelData, file, extension, filename });
                },
                function (error) {
                  console.error(error);
                }
              );
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case '3ds': {
          reader.addEventListener(
            'load',
            async function (event) {
              const { TDSLoader } = await import('three/addons/loaders/TDSLoader.js');
              const loader = new TDSLoader();
              const object = loader.parse(event.target.result);
              await onSuccess({ object, data: modelData, file, extension, filename });
              resolve({ object, data: modelData, file, extension, filename });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case '3mf': {
          reader.addEventListener(
            'load',
            async function (event) {
              const { ThreeMFLoader } = await import('three/addons/loaders/3MFLoader.js');
              const loader = new ThreeMFLoader();
              const object = loader.parse(event.target.result);
              await onSuccess({ object, data: modelData, file, extension, filename });
              resolve({ object, data: modelData, file, extension, filename });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case 'amf': {
          reader.addEventListener(
            'load',
            async function (event) {
              const { AMFLoader } = await import('three/addons/loaders/AMFLoader.js');
              const loader = new AMFLoader();
              const object = loader.parse(event.target.result);
              await onSuccess({ object, data: modelData, file, extension, filename });
              resolve({ object, data: modelData, file, extension, filename });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case 'dae': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              const { ColladaLoader } = await import('three/addons/loaders/ColladaLoader.js');

              const loader = new ColladaLoader(manager);
              const collada = loader.parse(contents);

              collada.scene.name = filename;
              await onSuccess({ object: collada.scene, data: modelData, file, extension, filename });
              resolve({ object: collada.scene, data: modelData });
            },
            false
          );
          reader.readAsText(file);

          break;
        }

        case 'drc': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');

              const loader = new DRACOLoader();
              loader.setDecoderPath('three/examples/jsm/libs/draco/');
              loader.parse(contents, async function (geometry) {
                let object;

                if (geometry.index !== null) {
                  const material = new THREE.MeshStandardMaterial();

                  object = new THREE.Mesh(geometry, material);
                  object.name = filename;
                } else {
                  const material = new THREE.PointsMaterial({ size: 0.01 });
                  material.vertexColors = geometry.hasAttribute('color');

                  object = new THREE.Points(geometry, material);
                  object.name = filename;
                }

                loader.dispose();
                await onSuccess({ object, data: modelData, file, extension, filename });
                resolve({ object, data: modelData, file, extension, filename });
              });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case 'fbx': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;
              const { FBXLoader } = await import('three/addons/loaders/FBXLoader.js');
              const loader = new FBXLoader(manager);
              const object = loader.parse(contents);
              await onSuccess({ object, data: modelData, file, extension, filename });
              resolve({ object, data: modelData, file, extension, filename });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case 'glb': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              const loader = await createGLTFLoader();

              loader.parse(contents, '', async function (result) {
                const scene = result.scene;
                scene.name = filename;

                scene.animations.push(...result.animations);

                await onSuccess({ object: scene, data: modelData, file, extension, filename });
                loader.dracoLoader.dispose();
                loader.ktx2Loader.dispose();
                resolve({ object: scene, data: modelData });
              });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case 'gltf': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              const loader = await createGLTFLoader(manager);

              loader.parse(contents, '', async function (result) {
                const scene = result.scene;
                scene.name = filename;

                scene.animations.push(...result.animations);

                await onSuccess({ object: scene, data: modelData });
                loader.dracoLoader.dispose();
                loader.ktx2Loader.dispose();

                resolve({ object: scene, data: modelData });
              });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case 'js':
        case 'json': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              // 2.0

              if (contents.indexOf('postMessage') !== -1) {
                const blob = new Blob([contents], { type: 'text/javascript' });
                const url = URL.createObjectURL(blob);

                const worker = new Worker(url);

                worker.onmessage = async function (event) {
                  event.data.metadata = { version: 2 };
                  await handleJSON({ scope, data: event.data, modelData, onSuccess, file, extension, filename });
                  resolve({ object: event.data, data: modelData });
                };

                worker.postMessage(Date.now());

                return;
              }

              // >= 3.0

              let data;

              try {
                data = JSON.parse(contents);
              } catch (error) {
                alert(error);
                return;
              }

              await handleJSON({ scope, data, modelData, onSuccess, file, extension, filename });
              resolve({ object: data, data: modelData });
            },
            false
          );
          reader.readAsText(file);

          break;
        }
        // 暂时不支持
        // case 'ifc': {
        //   reader.addEventListener(
        //     'load',
        //     async function (event) {
        //       const { IFCLoader } = await import('three/addons/loaders/IFCLoader.js');

        //       var loader = new IFCLoader();
        //       loader.ifcManager.setWasmPath('three/addons/loaders/ifc/');

        //       const model = await loader.parse(event.target.result);
        //       model.mesh.name = filename;
        //       onSuccess(model.mesh);

        //       // editor.execute(new AddObjectCommand(editor, model.mesh));
        //     },
        //     false
        //   );
        //   reader.readAsArrayBuffer(file);

        //   break;
        // }

        case 'kmz': {
          reader.addEventListener(
            'load',
            async function (event) {
              const { KMZLoader } = await import('three/addons/loaders/KMZLoader.js');

              const loader = new KMZLoader();
              const collada = loader.parse(event.target.result);

              collada.scene.name = filename;
              await onSuccess({ object: collada.scene, data: modelData, file, extension, filename });
              resolve({ object: collada.scene, data: modelData });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case 'ldr':
        case 'mpd': {
          reader.addEventListener(
            'load',
            async function (event) {
              const { LDrawLoader } = await import('three/addons/loaders/LDrawLoader.js');

              const loader = new LDrawLoader();
              loader.setPath('three/examples/models/ldraw/officialLibrary/');
              loader.parse(event.target.result, async function (group) {
                group.name = filename;
                // Convert from LDraw coordinates: rotate 180 degrees around OX
                group.rotation.x = Math.PI;
                await onSuccess({ object: group, data: modelData, file, extension, filename });
                resolve({ object: group, data: modelData });
              });
            },
            false
          );
          reader.readAsText(file);

          break;
        }

        case 'md2': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              const { MD2Loader } = await import('three/addons/loaders/MD2Loader.js');

              const geometry = new MD2Loader().parse(contents);
              const material = new THREE.MeshStandardMaterial();

              const mesh = new THREE.Mesh(geometry, material);
              mesh.mixer = new THREE.AnimationMixer(mesh);
              mesh.name = filename;

              mesh.animations.push(...geometry.animations);
              await onSuccess({ object: mesh, data: modelData, file, extension, filename });
              resolve({ object: mesh, data: modelData });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case 'obj': {
          reader.addEventListener(
            'load',
            async event => {
              const contents = event.target.result;

              const { OBJLoader } = await import('three/addons/loaders/OBJLoader.js');

              const object = new OBJLoader().parse(contents);
              object.name = filename;
              await onSuccess({ object, data: modelData, file, extension, filename });
              resolve({ object, data: modelData, file, extension, filename });
            },
            false
          );
          reader.readAsText(file);

          break;
        }

        case 'pcd': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              const { PCDLoader } = await import('three/examples/jsm/loaders/PCDLoader.js');

              const points = new PCDLoader().parse(contents);
              points.name = filename;
              await onSuccess({ object: points, data: modelData, file, extension, filename });
              resolve({ object: points, data: modelData });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case 'ply': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              const { PLYLoader } = await import('three/addons/loaders/PLYLoader.js');

              const geometry = new PLYLoader().parse(contents);
              let object;

              if (geometry.index !== null) {
                const material = new THREE.MeshStandardMaterial();

                object = new THREE.Mesh(geometry, material);
                object.name = filename;
              } else {
                const material = new THREE.PointsMaterial({ size: 0.01 });
                material.vertexColors = geometry.hasAttribute('color');

                object = new THREE.Points(geometry, material);
                object.name = filename;
              }
              await onSuccess({ object, data: modelData, file, extension, filename });
              resolve({ object, data: modelData, file, extension, filename });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case 'stl': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              const { STLLoader } = await import('three/addons/loaders/STLLoader.js');

              const geometry = new STLLoader().parse(contents);
              const material = new THREE.MeshStandardMaterial();

              const mesh = new THREE.Mesh(geometry, material);
              mesh.name = filename;
              await onSuccess({ object: mesh, data: modelData, file, extension, filename });
              resolve({ object: mesh, data: modelData });
            },
            false
          );

          if (reader.readAsBinaryString !== undefined) {
            reader.readAsBinaryString(file);
          } else {
            reader.readAsArrayBuffer(file);
          }

          break;
        }

        case 'svg': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              const { SVGLoader } = await import('three/addons/loaders/SVGLoader.js');

              const loader = new SVGLoader();
              const paths = loader.parse(contents).paths;

              //

              const group = new THREE.Group();
              group.scale.multiplyScalar(0.1);
              group.scale.y *= -1;

              for (let i = 0; i < paths.length; i++) {
                const path = paths[i];

                const material = new THREE.MeshBasicMaterial({
                  color: path.color,
                  depthWrite: false
                });

                const shapes = SVGLoader.createShapes(path);

                for (let j = 0; j < shapes.length; j++) {
                  const shape = shapes[j];

                  const geometry = new THREE.ShapeGeometry(shape);
                  const mesh = new THREE.Mesh(geometry, material);

                  group.add(mesh);
                }
              }
              await onSuccess({ object: group, data: modelData, file, extension, filename });
              resolve({ object: group, data: modelData });
            },
            false
          );
          reader.readAsText(file);

          break;
        }

        case 'usdz': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              const { USDZLoader } = await import('three/examples/jsm/loaders/USDZLoader.js');

              const group = new USDZLoader().parse(contents);
              group.name = filename;
              await onSuccess({ object: group, data: modelData, file, extension, filename });
              resolve({ object: group, data: modelData });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case 'vox': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              const { VOXLoader, VOXMesh } = await import('three/addons/loaders/VOXLoader.js');

              const chunks = new VOXLoader().parse(contents);

              const group = new THREE.Group();
              group.name = filename;

              for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];

                const mesh = new VOXMesh(chunk);
                group.add(mesh);
              }

              await onSuccess({ object: group, data: modelData, file, extension, filename });
              resolve({ object: group, data: modelData });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case 'vtk':
        case 'vtp': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              const { VTKLoader } = await import('three/addons/loaders/VTKLoader.js');

              const geometry = new VTKLoader().parse(contents);
              const material = new THREE.MeshStandardMaterial();

              const mesh = new THREE.Mesh(geometry, material);
              mesh.name = filename;

              await onSuccess({ object: mesh, data: modelData, file, extension, filename });
              resolve({ object: mesh, data: modelData });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        case 'wrl': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;
              const { VRMLLoader } = await import('three/addons/loaders/VRMLLoader.js');
              const result = new VRMLLoader().parse(contents);

              onSuccess({ object: result, data: modelData, file, extension, filename });
              await resolve({ object: result, data: modelData });
            },
            false
          );
          reader.readAsText(file);

          break;
        }

        case 'xyz': {
          reader.addEventListener(
            'load',
            async function (event) {
              const contents = event.target.result;

              const { XYZLoader } = await import('three/addons/loaders/XYZLoader.js');

              const geometry = new XYZLoader().parse(contents);

              const material = new THREE.PointsMaterial();
              material.vertexColors = geometry.hasAttribute('color');

              const points = new THREE.Points(geometry, material);
              points.name = filename;
              await onSuccess({ object: points, data: modelData, file, extension, filename });
              resolve({ object: points, data: modelData });
            },
            false
          );
          reader.readAsText(file);

          break;
        }

        case 'zip': {
          reader.addEventListener(
            'load',
            async function (event) {
              await handleZIP({
                scope: this,
                contents: event.target.result,
                modelData,
                onSuccess,
                file,
                extension,
                filename
              });
              resolve({ object: event.target.result, data: modelData });
            },
            false
          );
          reader.readAsArrayBuffer(file);

          break;
        }

        default:
          console.error('Unsupported file format (' + extension + ').');
          reject('Unsupported file format (' + extension + ').');
          break;
      }
    });
  }
}

export { Loader };
