# 什么是 HTTP

绝大多数的 web 应用都是基于 HTTP 来进行开发，对 web 的操作都是通过 HTTP 协议进行传输数据。

## HTTP 协议是客户端和服务器交互的一种通讯格式

所谓的交互，就是**请求**和**响应**,所谓的协议，实际上就是双方约定好的**格式**

HTTP 的诞生主要是为了**文档之间相互关联，形成超文本可以互相传阅**,可以认为**HTTP 是 web 通信的基础**

## HTTP 各个版本的特点

到目前为止，有以下的版本：

1. HTTP1.0
1. HTTP1.1
1. HTTP/2
1. HTTP/3

目前大多数使用的是 **HTTP1.1** 和 **HTTP/2**

**HTTP1.0** 默认是短连接，每次与服务器交互，都需要新开始一个连接

**HTTP1.1** 版本：

1. 最主要的是默认持久连接。只要客户端服务端任意一段没有明确提出断开 TCP 连接，就一直保持连接，可以发送多次 HTTP 请求
1. 其次就是断点续传（Chunked transfer-coding）。利用 HTTP 消息头使用分块传输编码，将实体主体分块传输。

**HTTP/2**版本：

1. 在 HTTP1.1 提出了管线化（pipelining）理论，但是默认都是关闭的。而 HTTP/2 允许同时通过单一的 TCP 连接发起多个请求和响应消息
1. 不再以文本方式传输，采用**二进制分帧层**，对头部进行压缩，支持流的控制

**HTTP/3**版本：

> Quic(QuickUDP Internet Connections)是一种新的传输方式，与 TCP 相比，它减少了延迟。表面上，Quic 非常类似于在 UDP 上实现的 TCP+TLS+HTTP/2

1. HTTP1.x 和 HTTP/2 底层都是 TCP，而 HTTP/3 底层是 UDP。使用 HTTP/3 能够减少 RTT（往返延时，包括 TCP 三次握手，TLS 握手）
