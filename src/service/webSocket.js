const WS = function (orgin, params = {}, successHandle, errorHandle) {
    this.url = `${orgin}/${params.sim}/${params.channel}`;

    this.repetition = true;//是否重连
    this.last_health_time = -1;// 上一次心跳时间
    this.reconnect = 0;//重连的时间
    this.reconnectMark = false; //是否重连过
    this.receiveMessageTimer = null;//定时判断没收到消息关闭的定时器
    this.keepAliveTimer = null;//定时发送心跳的定时器

    this.onmessage = res => {
        if (successHandle) {
            successHandle(res)
        }

        // 收到消息，重置定时器
        clearTimeout(this.receiveMessageTimer);
        // 30s没收到信息，代表服务器出问题了，关闭连接。
        this.receiveMessageTimer = setTimeout(() => {
            this.ws.close();
        }, 30000);
    };

    this.onerror = err => {
        if (errorHandle) {
            errorHandle(err)
        }
    }

    this.keepalive = () => {
        let time = new Date().getTime();
        // 断线重连（我们测试的环境是断开网络连接），断开网络后，心跳包无法发送出去，
        // 所以如果当前时间距离上次成功心跳的时间超过20秒，说明连接已经出现问题了，此时需要关闭连接。
        if (this.last_health_time !== -1 && time - this.last_health_time > 20000) {
            this.ws.close();
        } else {
            // 连接上之后，每秒发送一个心跳，服务器同样返回一个心跳，用来表示服务器没挂。
            // this.ws.ws.bufferedAmount === 0 && this.ws.ws.readyState === 1 均表示连接是正常的
            if (this.ws.bufferedAmount === 0 && this.ws.readyState === 1) {
                this.ws.send('heartbeat');
                this.last_health_time = time;
            }
        }
    }
    this.init();//初始化
}

WS.prototype.init = function () {

    window.WebSocket = window.WebSocket || window.MozWebSocket;

    if (!window.WebSocket) { // 检测浏览器支持
        console.error('错误: 浏览器不支持websocket');
        return;
    }

    this.ws = new WebSocket(this.url);

    if (this.ws) {
        this.ws.onopen = () => {
            this.reconnect = 0;
            this.reconnectMark = false;
            this.ws.send('player');

            // 30s没收到信息，代表服务器出问题了，关闭连接。如果收到消息了，重置该定时器。
            this.receiveMessageTimer = setTimeout(() => {
                this.ws.close();
            }, 30000);

            // 为1表示连接处于open状态，keepalive用来每秒发送一次心跳；
            if (this.ws.readyState === 1) {
                this.keepAliveTimer = setInterval(() => {
                    this.keepalive();
                }, 5000);
            }
        };

        this.ws.onmessage = res => {
            this.onmessage(res);
        }

        this.ws.onerror = err => {
            this.onerror(err);
        }

        this.ws.onclose = () => {
            console.log('关闭')
            clearTimeout(this.receiveMessageTimer);
            clearInterval(this.keepAliveTimer);
            console.log(this.repetition);
            if (!this.repetition) return;
            //保存ws对象
            let tempWs = this.ws;
            //如果没有重连过，进行重连。
            if (!this.reconnectMark) {
                this.reconnect = new Date().getTime();
                this.reconnectMark = true;
            }
            // 第一次关闭连接时websocket会尝试重连，设置了一个时间期限，10秒。
            // 10秒内如果能连上（恢复网络连接）就可以继续收发消息，连不上就关闭了，并且不会重连。
            if (new Date().getTime() - this.reconnect >= 10000) {
                this.ws.close();
                console.log('10秒未重连上关闭')
            } else {
                console.log('重连')
                this.ws = new WebSocket(this.url);
                this.ws.onopen = tempWs.onopen;
                this.ws.onmessage = tempWs.onmessage;
                this.ws.onerror = tempWs.onerror;
                this.ws.onclose = tempWs.onclose;
                this.last_health_time = -1;
            }
        };
    }
}

WS.prototype.on = function () {
    this.repetition = true;//是否重连
    this.last_health_time = -1;// 上一次心跳时间
    this.reconnect = 0;//重连的时间
    this.reconnectMark = false; //是否重连过
    this.receiveMessageTimer = null;//定时判断没收到消息关闭的定时器
    this.keepAliveTimer = null;//定时发送心跳的定时器
    clearTimeout(this.receiveMessageTimer);
    clearInterval(this.keepAliveTimer);

    this.init();
}

WS.prototype.stop = function () {
    this.repetition = false;
    this.ws.close();
}

export default WS;