/* eslint-disable @typescript-eslint/no-explicit-any */

export const createFilesMap = function (files: string | any[]) {
    const map: Record<string, any> = {};

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    map[file.name] = file;
  }

  return map;
};

export const getFilesFromItemList = function (items, onDone) {
  // TOFIX: setURLModifier() breaks when the file being loaded is not in root

  let itemsCount = 0;
  let itemsTotal = 0;

  const files = [];
  const filesMap = {};

  function onEntryHandled() {
    itemsCount++;

    if (itemsCount === itemsTotal) {
      onDone(files, filesMap);
    }
  }

  function handleEntry(entry) {
    if (entry.isDirectory) {
      const reader = entry.createReader();
      reader.readEntries(function (entries) {
        for (let i = 0; i < entries.length; i++) {
          handleEntry(entries[i]);
        }

        onEntryHandled();
      });
    } else if (entry.isFile) {
      entry.file(function (file) {
        files.push(file);

        filesMap[entry.fullPath.slice(1)] = file;
        onEntryHandled();
      });
    }

    itemsTotal++;
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.kind === 'file') {
      handleEntry(item.webkitGetAsEntry());
    }
  }
};
export const fetchBlobUrl = async function (url) {
  const response = await fetch(url);
  const blobData = await response.blob();
  return {
    response,
    blobUrl: URL.createObjectURL(blobData),
    file: blobData
  };
};
