import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = new Map();
    }

    connect(username, onNotificationReceived) {
        if (this.stompClient && this.stompClient.connected) {
            return;
        }

        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = null; // Disable debug logs

        this.stompClient.connect({}, (frame) => {
            console.log('Connected to WebSocket: ' + frame);

            // Subscribe to user-specific notifications
            const subscription = this.stompClient.subscribe(`/user/${username}/queue/notifications`, (message) => {
                if (message.body) {
                    const notification = JSON.parse(message.body);
                    onNotificationReceived(notification);
                }
            });

            this.subscriptions.set('notifications', subscription);
        }, (error) => {
            console.error('WebSocket connection error:', error);
            // Retry connection after 5 seconds
            setTimeout(() => this.connect(username, onNotificationReceived), 5000);
        });
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.disconnect();
            this.stompClient = null;
            this.subscriptions.clear();
            console.log('Disconnected from WebSocket');
        }
    }
}

export const webSocketService = new WebSocketService();
