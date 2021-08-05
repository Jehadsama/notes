# dns

## 什么是 dns

通常访问网站是通过域名的方式，在浏览器地址栏输入网址，就可以访问对应的网站。然而，计算机网络通信时只能识别 ip 地址。dns 域名系统的作用就是将域名转换为 ip 地址。
当我们访问一个域名的时候会有一个 DNS 域名系统，会将我们的域名转换为相应的 IP，所经历的步骤大致为：浏览器 DNS 缓存 —> 系统（OS）缓存 -> 路由器缓存 -> ISP DNS 缓存。
DNS 本地解析指的是 系统（OS）缓存 这一阶段，在浏览器 DNS 缓存未命中的情况下，会从本地系统的 hosts 文件寻找对应 IP。
ISP 为互联网服务提供商，目前我国有三大基础运营商：中国电信、中国移动和中国联通，在以上的三种情况下均找不到域名对应 IP 地址，就会进行到这一步 IPS 的 DNS 缓存查找。

## node.js dns 模块

1. dns 模块是基于 udp 协议实现。

1. nodejs 中 dns 模块分为两类：
   - 使用底层操作系统工具进行域名解析
   - 链接到一个 dns 网络服务器执行域名解析

### 底层操作工具域名解析

Node.js DNS 模块的 `dns.lookup()` 方法使用底层操作系统进行域名解析，是不需要经过任何网络通信的。也就是说，加入本地 hosts 文件被改动，查询结果也是改动后的结果

### 链接到 DNS 服务器执行域名解析

dns 模块中除`dns.lookup()`之外的所有函数，都会连接到实际 DNS 服务器以执行名称解析并始终使用网络执行 DNS 查询，看以下`dns.resolve()`函数与`dns.lookup()`的不同。
使用`dns.resolve`会发现即使我们修改了 hosts 文件，也不受影响还是从外部读取正常的地址。

### dns.lookup() 与 dns.resolve() 不同

#### dns.lookup() 是同步的还是异步的？

尽管以异步 JavaScript 的角度来调用 `dns.lookup()`，但在内部 libuv 底层线程池中却是同步的调用 `getaddrinfo(3)`，所以可能会由于一些不确定因素造成 Node 进程阻塞。
与 `dns.lookup()` 不同的是 `dns.resolve()` 这些方法没有使用 `getaddrinfo(3)`，是通过网络执行的 DNS 查询，始终是保持异步不会对其它进程产生负面影响。
具体见: <http://nodejs.cn/api/dns.html#dns_implementation_considerations>
