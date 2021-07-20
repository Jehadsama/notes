// 测试例子
const opContents = [
  {
    opContent:
      '[ClientName=厍筝拦];[C=101700];[R=];[H=];[P=服务];[Match=投资者确认：费用。];[ClientName=厍筝拦];[Date=2020-12-16]',
  },
  { opContent: '[ClientName=厍筝拦];[Date=2020-12-16]' },
  {
    opContent:
      '[B=济南];[ClientName=厍筝拦];[C=600];[B=济南];[ClientName=厍筝拦];[Date=2020-12-16];',
  },
];

const clientName = '橘右京';

// 期望替换ClientName的名字
const regex = /\[ClientName=(\S\W+)\]/gi;

const result = opContents.map(({ opContent }) => ({
  opContent: opContent.replace(regex, `[ClientName=${clientName}]`),
}));

// 结果复合预期
// [
//   {
//     opContent:
//       '[ClientName=橘右京];[C=101700];[R=];[H=];[P=服务];[Match=投资者确认：费用。];[ClientName=橘右京];[Date=2020-12-16]',
//   },
//   {
//     opContent: '[ClientName=橘右京];[Date=2020-12-16]',
//   },
//   {
//     opContent:
//       '[B=济南];[ClientName=橘右京];[C=600];[B=济南];[ClientName=橘右京];[Date=2020-12-16];',
//   },
// ];
