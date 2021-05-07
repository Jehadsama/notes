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

### 待检测字符串

- 弗雷尔卓德
- 亚索
- 暗影之岛

### 构造结构

```json
{
  "德": {
    "玛": {
      "西": {
        "亚": {
          "isEnd": true
        }
      }
    }
  },
  "诺": {
    "克": {
      "萨": {
        "说": {
          "isEnd": true
        }
      }
    }
  },
  "弗": {
    "雷": {
      "尔": {
        "卓": {
          "德": {
            "isEnd": true
          }
        }
      }
    }
  },
  "暗": {
    "影": {
      "之": {
        "岛": {
          "isEnd": true
        }
      }
    }
  }
}
```

### 期望结果

输出 `弗雷尔卓德`，`暗影之岛`

## 实现

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
