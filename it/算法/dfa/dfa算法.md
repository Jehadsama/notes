# DFA 算法

## 为什么写这篇文章？

最近回忆起来这几年做过的项目，其中有一个关于敏感词检测服务，当中就用到这个 DFA 算法，所以这里记录一下

## 什么是 DFA

DFA 全称 Deterministic Finite Automaton,即确定有穷自动机。特征是：有一个有限状态集合和一些从一个状态通向另一个状态的边，每条边上标记有一个符号，其中一个状态是初态，某些状态是终态。
但不同于不确定的有限自动机，DFA 中不会有从同一状态出发的两条边标志有相同的符号。

## 准备

### 敏感词数组

- 德玛西亚
- 诺克萨斯
- 弗雷尔卓德
- 暗影之岛

### 待检测的字符串

- 德玛西亚

### 树状结构

- 德
  - 玛
    - 西
      - 亚
        - end
    - 东
      - 亚
        - end
  - 牛
    - 西
      - 亚
        - end
- 诺
  - 克
    - 萨
      - 斯
        - end

### 构造结构

```json
{
  "德": {
    "玛": {
      "西": {
        "亚": {
          "isEnd": true
        }
      },
      "东": {
        "亚": {
          "isEnd": true
        }
      }
    },
    "牛": {
      "西": {
        "亚": {
          "isEnd": true
        }
      }
    }
  },
  "诺": {
    "科": {
      "萨": {
        "斯": {
          "isEnd": true
        }
      }
    }
  }
}
```

### 期望结果

输出 `德玛西亚`

## 实现

### javascript 代码实现

```js
/** 传入敏感词短语数组，构造字典
 * @param {string[]} 敏感词汇
 */
const buildMap = (wordList) => {
  const result = {};
  // 1. 循环敏感词数组
  for (let i = 0; i < wordList.length; ++i) {
    let map = result;
    console.log(0, map === result);
    const word = wordList[i];
    // 2. 循环每个敏感词短语
    for (let j = 0; j < word.length; ++j) {
      const ch = word.charAt(j);
      // 3. 判断是不是存在下一个字符
      if (typeof map[ch] !== 'undefined') {
        // 不是
        map = map[ch];
        if (map.isEnd) {
          break;
        }
      } else {
        // 4. 没存在下一个字符,就得删了当前层的isEnd,然后给下一个层赋isEnd
        if (map.isEnd) {
          delete map.isEnd;
        }
        map[ch] = { isEnd: true };
        map = map[ch];
      }
    }
  }
  return result;
};

/** 传入buildMap结果以及目标词汇
 * @param {object} buildMap结果
 * @param {string} 敏感词汇
 */
const check = (map, content) => {
  const result = [];
  const count = content.length;
  let stack = [];
  let point = map;

  for (let i = 0; i < count; ++i) {
    const ch = content.charAt(i);
    const item = point[ch];
    if (typeof item === 'undefined') {
      i -= stack.length;
      stack = [];
      point = map;
    } else if (item.isEnd) {
      stack.push(ch);
      result.push(stack.join(''));
      stack = [];
      point = map;
    } else {
      stack.push(ch);
      point = item;
    }
  }
  return result;
};
```

### 测试结果

```js
const map = buildMap(['德玛西亚', '德玛东亚', '德牛西亚', '诺克萨斯']);

const result = check(map, '德玛西亚');

// output:
// 德玛西亚
```

说明测试结果符合预期

## 优化思路

2.1 敏感词中间填充无意义字符问题
对于“王\*八&&蛋”这样的词，中间填充了无意义的字符来混淆，在我们做敏感词搜索时，同样应该做一个无意义词的过滤，当循环到这类无意义的字符时进行跳过，避免干扰。

2.2 敏感词用拼音或部分用拼音代替
两种解决思路：一种是最简单是遇到这类问题，先丰富敏感词库进行快速解决。第二种是判断时将敏感词转换为拼音进行对比判断。

不过目前这两种方案均不能彻底很好的解决该问题，此类问题还需进一步研究。
