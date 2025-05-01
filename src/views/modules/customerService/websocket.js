
let socket;
let heartbeatInterval = null;
const soundEffect = new Audio(require('@/assets/y1478.wav')); // 假设音频文件存放在 src/assets 目录

export const connectWebSocket = (userId, vueInstance,onMessageReceived) => {
    socket = new WebSocket(`wss://admin.xxscch.org/ws/${userId}`); // 确保URL正确

    socket.onopen = () => {
        vueInstance.$message.success('链接成功.');
        startHeartbeat();
    };

    socket.onmessage = (event) => {
        console.log("onMessage:" + event.data)
        const message = JSON.parse(event.data);
        if(message.type === 2) return ;
        playNotificationSound();
        onMessageReceived(message);

    };
    socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event);
        vueInstance.$message.error('WebSocket 链接断开.');
        stopHeartbeat(); 
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        vueInstance.$message.error('WebSocket 链接发生错误.');
        socket.close(); // Close connection on error to trigger the onclose event
    };
 
};
const startHeartbeat =()=>{
    heartbeatInterval = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 2, content: 'ping' }));
            console.log('Sent heartbeat message');
        }
        
    }, 5000);
}

const stopHeartbeat =()=>{
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

const getCurrentTime = () =>{
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}


export const buildMessage = (senderId,reciverId,type,content)=>{
    let _message_ = {
        id:senderId+"-"+new Date().getTime(),
        type:type,
        senderId:senderId,
        reciverId:reciverId,
        content:content,
        created: getCurrentTime()
    };
    return _message_;
}

export const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        try {
            socket.send(JSON.stringify(message));
            console.log("Sent message:", message);
        } catch (error) {
            console.error("Error sending message:", error);
        }
        return true;
    } else {
        console.warn("WebSocket is not open. Message not sent:");
        return false;
    }
};

const playNotificationSound = () => {
    try {
        soundEffect.play();
    } catch (error) {
        console.error("Error playing sound:", error);
    }
};