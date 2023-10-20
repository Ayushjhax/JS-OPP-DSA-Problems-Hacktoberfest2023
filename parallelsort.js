// Multithreading utility for parallel execution
function parallelize(func, args, numThreads) {
  const chunkSize = Math.ceil(args.length / numThreads);
  const promises = [];

  for (let i = 0; i < numThreads; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    const chunk = args.slice(start, end);
    promises.push(new Promise(resolve => {
      const worker = new Worker('worker.js'); // Create a Web Worker
      worker.postMessage({ func, args: chunk });
      worker.onmessage = event => {
        resolve(event.data);
        worker.terminate();
      };
    }));
  }

  return Promise.all(promises);
}

// Memoization table to store results of subproblems
const memo = new Map();

function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }

  if (memo.has(arr.toString())) {
    return memo.get(arr.toString());
  }

  const pivot = arr[0];
  const smaller = [];
  const greater = [];
  let recursiveCalls = 1;

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] <= pivot) {
      smaller.push(arr[i]);
    } else {
      greater.push(arr[i]);
    }
    recursiveCalls++;
  }

  return Promise.all([
    parallelize(quickSort, smaller, 4),
    parallelize(quickSort, greater, 4)
  ]).then(([sortedSmaller, sortedGreater]) => {
    const sortedArray = sortedGreater.concat([pivot], sortedSmaller);
    memo.set(arr.toString(), sortedArray);
    return { sortedArray, recursiveCalls };
  });
}

const inputArray = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
quickSort(inputArray).then(result => {
  console.log("Sorted Array:", result.sortedArray);
  console.log("Total Recursive Calls:", result.recursiveCalls);
});
