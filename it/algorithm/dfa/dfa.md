# DFA 算法

## 为什么写这篇文章？

最近回忆起来这几年做过的项目，其中有一个关于敏感词检测服务，当中就用到这个 DFA 算法，所以这里记录一下

## 需求背景

项目需求是对敏感词做一个过滤，有以下方案：

1. 直接将敏感词构造成`字符串`或`数组`，然后遍历查询

1. 将敏感词存入数据库，查询数据库

1. 利用 elasticsearch+ik 分词器 建立分词索引来查询（本质还是利用了 Lucene）

1. DFA 算法

项目收集到的敏感词比较多，目测不少于几千，排除方案 1。

为了方便以后的扩展性尽量减少对数据库的依赖，排除方案 2。

同样本着轻量原则，为了减少引入更多系统，减少学习和使用成本，（Lucene 本身作为本地索引，敏感词增加后需要触发更新索引），排除方案 3

最后选择方案 4。

## 什么是 DFA

DFA 全称 Deterministic Finite Automaton,即确定有穷自动机。特征是：有一个有限状态集合和一些从一个状态通向另一个状态的边，每条边上标记有一个符号，其中一个状态是初态，某些状态是终态。
但不同于不确定的有限自动机，DFA 中不会有从同一状态出发的两条边标志有相同的符号。

可以认为，通过 `event` 和当前的 `state` 得到下一个 `state`，即 `event + state = nextstate`。系统中有多个节点，通过传递进入的 `event`，来确定走哪个路由至另一个节点，而节点是有限的。

## 准备

### 敏感词数组

- 德玛西亚
- 德玛东亚
- 德牛西亚
- 诺克萨斯

### 待检测的字符串

- 德玛西亚

### 树状结构

![帅气的我手画树状图](https://github.com/Jehadsama/notes/blob/master/it/algorithm/dfa/dfa.png)

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
    const word = wordList[i];
    // 2. 循环每个敏感词短语
    for (let j = 0; j < word.length; ++j) {
      const ch = word.charAt(j);
      // 3. 判断这个字是不是已经存在于map里面
      if (typeof map[ch] !== 'undefined') {
        // 存在该字符
        map = map[ch]; // 重点就是这一句了,下同
        if (map.isEnd) {
          break;
        }
      } else {
        // 4. 没存在该字符,就得删了当前层的isEnd,然后给下一个层赋isEnd
        if (map.isEnd) {
          delete map.isEnd;
        }
        map[ch] = { isEnd: true };
        map = map[ch]; // 重点就是这一句了,同上
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

const result = check(map, '弗雷尔卓德德玛西亚暗影岛');

// output:
// 德玛西亚
```

说明测试结果符合预期

## 后续改进

当前是公司需求针对固定词汇检测，如股票名称，股票代码，所以完全匹配可以实现需求。

但假如需求拓展：

1. 敏感词中间填充无意义字符问题，例如 `德玛&西亚`、`德#玛西亚(`、`德*玛d%西#亚`

   一个思路是：同样应该做一个无意义词的过滤，当循环到这类无意义的字符时进行忽略，避免干扰

2. 敏感词用拼音或部分用拼音代替

   思路 1：丰富敏感词库

   思路 2：判断时将敏感词转换为拼音进行对比判断

3. 一些形似的字符不能被检测过滤，如敏感词`微信`，待检测的词汇为`徽信`

   这种情况考虑是引入机器学习，但这已经是另外一个研究范围啦。
