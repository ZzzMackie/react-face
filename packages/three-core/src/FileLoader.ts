/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three';

import { TGALoader } from 'three/addons/loaders/TGALoader.js';

import { getFilesFromItemList, createFilesMap } from './LoaderUtils.js';

import { unzipSync, strFromU8 } from 'three/addons/libs/fflate.module.js';
import type { ThreeEngine } from '../types/main.d.ts';
import type {
  GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
import type { 
  FileLoaderResult,
  HandleJSONParams,
  HandleZIPParams,
  LoadFileOptions,
  LoadFilesOptions,
 } from '../types/FileLoader.d.ts';
import { Chunk } from 'three/examples/jsm/loaders/VOXLoader.js';

 async function handleJSON(params: HandleJSONParams): Promise<void> {
    const { scope, data, modelData, onSuccess, file, extension, filename } = params;
    
    if (!data.metadata) {
      data.metadata = { type: 'Geometry' };
    }
  
    if (!data.metadata.type) {
      data.metadata.type = 'Geometry';
    }
  
    if (data.metadata.formatVersion) {
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
  
      case 'object':
        await scope.threeEngine.addModelObject({ data });
        break;
  
      case 'app':
        await scope.threeEngine.addModelObject({ data: data.scene });
        break;
    }
  }

 
  async function handleZIP(params: HandleZIPParams): Promise<void> {
    const { contents, modelData, onSuccess, file, extension, filename } = params;
    const zip = unzipSync(new Uint8Array(contents));
  
    // Handle Poly format
    if (zip['model.obj'] && zip['materials.mtl']) {
      const { MTLLoader } = await import('three/addons/loaders/MTLLoader.js');
      const { OBJLoader } = await import('three/addons/loaders/OBJLoader.js');
      const materials = new MTLLoader().parse(strFromU8(zip['materials.mtl']), '');
      const object = new OBJLoader().setMaterials(materials).parse(strFromU8(zip['model.obj']));
      await onSuccess({ object, data: modelData, file, extension, filename });
    }
  
    // Process other files in ZIP
    for (const path in zip) {
      const fileData = zip[path];
      const extension = path.split('.').pop()?.toLowerCase() || '';
      
      const manager = new THREE.LoadingManager();
      manager.setURLModifier((url: string) => {
        const file = zip[url];
        if (file) {
          console.log('Loading', url);
          return URL.createObjectURL(new Blob([file.buffer], { type: 'application/octet-stream' }));
        }
        return url;
      });
  
      switch (extension) {
        case 'fbx': {
          const { FBXLoader } = await import('three/addons/loaders/FBXLoader.js');
          const loader = new FBXLoader(manager);
          const object = loader.parse(fileData.buffer, '');
          await onSuccess({ object, data: modelData, file, extension, filename });
          break;
        }
  
        case 'glb':
        case 'gltf': {
          const loader = await createGLTFLoader(extension === 'gltf' ? manager : undefined);
          const parseData = extension === 'gltf' ? strFromU8(fileData) : fileData.buffer;
          
          loader.parse(parseData, '', async (result: any) => {
            const scene = result.scene;
            scene.animations.push(...result.animations);
            await onSuccess({ object: scene, data: modelData, file, extension, filename });
            loader.dracoLoader?.dispose();
            loader.ktx2Loader?.dispose();
          });
          break;
        }
      }
    }
  }

  async function createGLTFLoader(manager?: THREE.LoadingManager): Promise<GLTFLoader> {
    const [{ GLTFLoader }, { DRACOLoader }, { KTX2Loader }, { MeshoptDecoder }] = await Promise.all([
      import('three/addons/loaders/GLTFLoader.js'),
      import('three/addons/loaders/DRACOLoader.js'),
      import('three/addons/loaders/KTX2Loader.js'),
      import('three/addons/libs/meshopt_decoder.module.js')
    ]);
  
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('three/examples/jsm/libs/draco/gltf/');
  
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('three/examples/jsm/libs/basis/');
  
    const loader = new GLTFLoader(manager);
    loader.setDRACOLoader(dracoLoader);
    loader.setKTX2Loader(ktx2Loader);
    loader.setMeshoptDecoder(MeshoptDecoder);
  
    loader.dracoLoader = dracoLoader;
    loader.ktx2Loader = ktx2Loader;
  
    return loader;
  }

  interface MeshWithMixerParams {
    mesh: THREE.SkinnedMesh;
    mixer: THREE.AnimationMixer;
  }
class Loader {
  private threeEngine: ThreeEngine;
  private texturePath: string;

  constructor(threeEngine: ThreeEngine) {
    this.threeEngine = threeEngine;
    this.texturePath = '';
  }

  loadItemList(items: string | File[]): void {
    getFilesFromItemList(items, (files, filesMap) => {
      this.loadFiles({ files, filesMap });
    });
  }

  async loadFiles({ files, filesMap, modelData, onSuccess }: LoadFilesOptions): Promise<void | PromiseSettledResult<void | FileLoaderResult>[] | FileLoaderResult> {
    if (files.length === 0) {
      return Promise.resolve();
    }
    if (files.length > 0) {
      filesMap = filesMap || createFilesMap(files);

      const manager = new THREE.LoadingManager();
      manager.setURLModifier(function (url: string) {
        url = url.replace(/^(\.?\/)/, ''); // remove './'
        if (filesMap === undefined) {
          filesMap = createFilesMap(files);
        }
        const file = filesMap[url];

        if (file) {
          console.log('Loading', url);

          return URL.createObjectURL(file);
        }

        return url;
      });

      manager.addHandler(/\.tga$/i, new TGALoader());

      const allFilePromise = files.map(file => {
        return this.loadFile({
          file,
          manager,
          modelData,
          onSuccess
        });
      });
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
  }: LoadFileOptions): Promise<FileLoaderResult | void> {
    return new Promise((resolve, reject) => {
      const filename = file.name;
      const extension = (filename.split('.').pop() || '').toLowerCase() || '';

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
              if (event.target) {
                const contents = event.target.result;

                // 检查 contents 是否为 null
                if (contents === null) {
                  console.error('加载的内容为空');
                  return;
                }
                let buffer;
                if (typeof contents === 'string') {
                  const encoder = new TextEncoder();
                  buffer = encoder.encode(contents).buffer;
                } else {
                  buffer = contents;
                }
                const { Rhino3dmLoader } = await import('three/addons/loaders/3DMLoader.js');

                const loader = new Rhino3dmLoader();
                loader.setLibraryPath('three/examples/jsm/libs/rhino3dm/');
                loader.parse(
                  buffer,
                  async function (object) {
                    object.name = filename;

                    await onSuccess({ object, data: modelData, file, extension, filename });
                    resolve({ object, data: modelData, file, extension, filename });
                  },
                  function (error) {
                    console.error(error);
                  }
                );
              }
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
              if (event.target && event.target.result) {
                if (event.target.result instanceof ArrayBuffer) {
                  const { TDSLoader } = await import('three/addons/loaders/TDSLoader.js');
                  const loader = new TDSLoader();
                  const object = loader.parse(event.target.result, '');
                  await onSuccess({ object, data: modelData, file, extension, filename });
                  resolve({ object, data: modelData, file, extension, filename });
                }
              }
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
              
              if (event.target && event.target.result) {
                const { ThreeMFLoader } = await import('three/addons/loaders/3MFLoader.js');
                const loader = new ThreeMFLoader();
                const object = loader.parse(event.target.result as ArrayBuffer);
                await onSuccess({ object, data: modelData, file, extension, filename });
                resolve({ object, data: modelData, file, extension, filename });
              }
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
              const object = loader.parse(event.target?.result as ArrayBuffer);
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
              if (event.target?.result) {
                const contents = event.target?.result ?? '';
                const contentString = typeof contents === 'string' ? contents : new TextDecoder().decode(contents);
                const { ColladaLoader } = await import('three/addons/loaders/ColladaLoader.js');
  
                const loader = new ColladaLoader(manager);
                const collada = loader.parse(contentString, '');
  
                collada.scene.name = filename;
                await onSuccess({ object: collada.scene, data: modelData, file, extension, filename });
                resolve({ object: collada.scene, data: modelData, file, extension, filename });
              }
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
              if (event.target && event.target.result) {

                const contents = event.target.result;

                const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');
  
                const loader = new DRACOLoader();
                loader.setDecoderPath('three/examples/jsm/libs/draco/');
                loader.parse(contents as ArrayBuffer, async function (geometry) {
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
              }
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
              if (event.target && event.target.result) {
                const contents = event.target.result;
                const { FBXLoader } = await import('three/addons/loaders/FBXLoader.js');
                const loader = new FBXLoader(manager);
                const object = loader.parse(contents, '');
                await onSuccess({ object, data: modelData, file, extension, filename });
                resolve({ object, data: modelData, file, extension, filename });
              }
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
              const contents = event.target?.result;

              const loader = await createGLTFLoader();

              loader.parse(contents as ArrayBuffer, '', async function (result) {
                const scene = result.scene;
                scene.name = filename;

                scene.animations.push(...result.animations);

                await onSuccess({ object: scene, data: modelData, file, extension, filename });
                loader?.dracoLoader?.dispose();
                loader.ktx2Loader?.dispose();
                resolve({ object: scene, data: modelData, file, extension, filename });
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
              const contents = event.target?.result;

              const loader = await createGLTFLoader(manager);

              loader.parse(contents as ArrayBuffer, '', async function (result) {
                const scene = result.scene;
                scene.name = filename;

                scene.animations.push(...result.animations);

                await onSuccess({ object: scene, data: modelData, file, extension, filename });
                loader?.dracoLoader?.dispose();
                loader.ktx2Loader?.dispose();

                resolve({ object: scene, data: modelData, file, extension, filename });
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
            async (event) => {
              const contents = event.target?.result;

              // 2.0
              if (typeof contents === 'string') {
                if (contents.indexOf('postMessage') !== -1) {
                  const blob = new Blob([contents], { type: 'text/javascript' });
                  const url = URL.createObjectURL(blob);
  
                  const worker = new Worker(url);
  
                  worker.onmessage = async (event) => {
                    event.data.metadata = { version: 2 };
                    await handleJSON({ scope: this, data: event.data, modelData, onSuccess, file, extension, filename });
                    resolve({ object: event.data, data: modelData, file, extension, filename });
                  };
  
                  worker.postMessage(Date.now());
  
                  return;
                }
              }

              // >= 3.0

              let data;

              try {
                data = JSON.parse(contents as string);
              } catch (error) {
                alert(error);
                return;
              }

              await handleJSON({ scope: this, data, modelData, onSuccess, file, extension, filename });
              resolve({ object: data, data: modelData, file, extension, filename });
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
              const collada = loader.parse(event.target?.result as ArrayBuffer);

              collada.scene.name = filename;
              await onSuccess({ object: collada.scene, data: modelData, file, extension, filename });
              resolve({ object: collada.scene, data: modelData, file, extension, filename });
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
              loader.parse(event.target?.result as string, '', async function (group) {
                group.name = filename;
                // Convert from LDraw coordinates: rotate 180 degrees around OX
                group.rotation.x = Math.PI;
                await onSuccess({ object: group, data: modelData, file, extension, filename });
                resolve({ object: group, data: modelData, file, extension, filename });
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
              const contents = event.target?.result;

              const { MD2Loader } = await import('three/addons/loaders/MD2Loader.js');

              const geometry = new MD2Loader().parse(contents as ArrayBuffer);
              const material = new THREE.MeshStandardMaterial();
              if ((geometry as any).bones && (geometry as any).bones.length > 0) {
                const mesh = new THREE.SkinnedMesh(geometry, material);
                const meshWithMixer:MeshWithMixerParams = {
                  mesh,
                  mixer: new THREE.AnimationMixer(mesh)
                };
                
                meshWithMixer.mesh.name = filename;
                const geometryWithAnimations = geometry as THREE.BufferGeometry & { animations?: THREE.AnimationClip[] };
                if (geometryWithAnimations.animations && geometryWithAnimations.animations.length !== 0) {
                    meshWithMixer.mesh.animations.push(...geometryWithAnimations.animations);
                }
                await onSuccess({ object: mesh, data: modelData, file, extension, filename });
                resolve({ object: mesh, data: modelData, file, extension, filename });
                
              }
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
              const contents = event.target?.result;
              if (!contents) {
                throw new Error('Failed to load file contents');
              }

              const { OBJLoader } = await import('three/addons/loaders/OBJLoader.js');

              const object = new OBJLoader().parse(contents as string);
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
              const contents = event.target?.result;
              if (!contents) {
                throw new Error('Failed to load file contents');
              }

              const { PCDLoader } = await import('three/examples/jsm/loaders/PCDLoader.js');

              const points = new PCDLoader().parse(contents as ArrayBuffer);
              points.name = filename;
              await onSuccess({ object: points, data: modelData, file, extension, filename });
              resolve({ object: points, data: modelData, file, extension, filename });
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
              const contents = event.target?.result;
              if (!contents) {
                throw new Error('Failed to load file contents');
              }

              const { PLYLoader } = await import('three/addons/loaders/PLYLoader.js');

              const geometry = new PLYLoader().parse(contents as ArrayBuffer);
              let object;

              if (geometry.index !== null) {
                const material = new THREE.MeshStandardMaterial();

                object = new THREE.Mesh(geometry, material);
                object.name = filename;
              } else {
                const material = new THREE.PointsMaterial();
                material.vertexColors = (geometry as THREE.BufferGeometry).hasAttribute('color');

                object = new THREE.Points(geometry as THREE.BufferGeometry, material);
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
              const contents = event.target?.result;
              if (!contents) {
                throw new Error('Failed to load file contents');
              }

              const { STLLoader } = await import('three/addons/loaders/STLLoader.js');

              const geometry = new STLLoader().parse(contents);
              const material = new THREE.MeshStandardMaterial();

              const mesh = new THREE.Mesh(geometry, material);
              mesh.name = filename;
              await onSuccess({ object: mesh, data: modelData, file, extension, filename });
              resolve({ object: mesh, data: modelData, file, extension, filename });
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
              const contents = event.target?.result;
              if (!contents) {
                throw new Error('Failed to load file contents');
              }

              const { SVGLoader } = await import('three/addons/loaders/SVGLoader.js');

              const loader = new SVGLoader();
              const paths = loader.parse(contents as string).paths;

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
              resolve({ object: group, data: modelData, file, extension, filename });
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
              const contents = event.target?.result;
              if (!contents) {
                throw new Error('Failed to load file contents');
              }

              const { USDZLoader } = await import('three/examples/jsm/loaders/USDZLoader.js');

              const group = new USDZLoader().parse(contents);
              group.name = filename;
              await onSuccess({ object: group, data: modelData, file, extension, filename });
              resolve({ object: group, data: modelData, file, extension, filename });
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
              const contents = event.target?.result;
              if (!contents) {
                throw new Error('Failed to load file contents');
              }

              const { VOXLoader, VOXMesh } = await import('three/addons/loaders/VOXLoader.js');

              const chunks = new VOXLoader().parse(contents as ArrayBuffer);

              const group = new THREE.Group();
              group.name = filename;

              for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];

                const mesh = new VOXMesh(chunk as Chunk);
                group.add(mesh);
              }

              await onSuccess({ object: group, data: modelData, file, extension, filename });
              resolve({ object: group, data: modelData, file, extension, filename });
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
              const contents = event.target?.result;
              if (!contents) {
                throw new Error('Failed to load file contents');
              }

              const { VTKLoader } = await import('three/addons/loaders/VTKLoader.js');

              const geometry = new VTKLoader().parse(contents as ArrayBuffer, '');
              const material = new THREE.MeshStandardMaterial();

              const mesh = new THREE.Mesh(geometry, material);
              mesh.name = filename;

              await onSuccess({ object: mesh, data: modelData, file, extension, filename });
              resolve({ object: mesh, data: modelData, file, extension, filename });
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
              const contents = event.target?.result;
              if (!contents) {
                throw new Error('Failed to load file contents');
              }
              const { VRMLLoader } = await import('three/addons/loaders/VRMLLoader.js');
              const result = new VRMLLoader().parse(contents as string, '');

              onSuccess({ object: result, data: modelData, file, extension, filename });
              await resolve({ object: result, data: modelData, file, extension, filename });
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
              const contents = event.target?.result;
              if (!contents) {
                throw new Error('Failed to load file contents');
              }

              const { XYZLoader } = await import('three/addons/loaders/XYZLoader.js');

              // 使用any类型断言避开类型检查
              const geometry = (new XYZLoader() as any).parse(contents as string);

              const material = new THREE.PointsMaterial();
              material.vertexColors = (geometry as THREE.BufferGeometry).hasAttribute('color');

              const points = new THREE.Points(geometry as THREE.BufferGeometry, material);
              points.name = filename;
              await onSuccess({ object: points, data: modelData, file, extension, filename });
              resolve({ object: points, data: modelData, file, extension, filename });
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
                contents: event.target?.result as ArrayBuffer,
                modelData,
                onSuccess,
                file,
                extension,
                filename
              });
              resolve({ object: event.target?.result as unknown as THREE.Object3D, data: modelData, file, extension, filename });
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
