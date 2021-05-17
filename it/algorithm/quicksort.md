# 快速排序（Quick Sort）

> 排序算法（Sorting algorithm）是计算机科学最古老、最基本的课题之一。要想成为合格的程序员，就必须理解和掌握各种排序算法。
>
> 目前，最常见的排序算法大概有七八种，其中"快速排序"（Quicksort）使用得最广泛，速度也较快。它是图灵奖得主 C. A. R. Hoare（1934--）于 1960 时提出来的。

## 原理

"快速排序"的整个排序过程分为三步：

（1）在数据集之中，选择一个元素作为"基准"（pivot）。

（2）所有小于"基准"的元素，都移到"基准"的左边；所有大于"基准"的元素，都移到"基准"的右边。

（3）对"基准"左边和右边的两个子集，不断重复第一步和第二步，直到所有子集只剩下一个元素为止。

## 实验

测试数据：`3,2,4,7,5,6,1,8,9,0`

期望结果：`0,1,2,3,4,5,6,7,8,9`

## 实现

### js 代码实现

```js
const quickSort = (arr) => {
  // 数组长度小于等于1就直接返回好了
  if (arr.length <= 1) {
    return arr;
  }

  // 计算基准数
  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr.splice(pivotIndex, 1)[0];

  // 建立左右2个数组，小于<=pivot放进左数组，否则放入右数组
  const left = [];
  const right = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    item <= pivot ? left.push(item) : right.push(item);
  }

  // 递归，然后拼接数组
  return quickSort(left).concat([pivot], quickSort(right));
};
```

### 测试结果

符合预期
