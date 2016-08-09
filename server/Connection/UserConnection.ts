import {Connection, ConnectionType, Events} from "./Connection";

/**
 * Connections to user clients
 */
export class UserConnection extends Connection {

    /**
     * @return {string}
     */
    getType(): ConnectionType {
        return "user";
    }

    /**
     * Implements all user connection specific handlers
     *
     * @param {SocketIO.Socket} socket
     */
    protected addHandlers(socket: SocketIO.Socket) {
        socket.on(Events.JoinQueue, this.joinQueueHandler);
        socket.on(Events.Ready, this.readyHandler);
    }

    /**
     * Event: Events.JoinQueue
     *
     * Moves user connection from new connections to queue
     */
    joinQueueHandler = () => {
        console.log("adding user connection to queue - " + this.getIdentifierString());
        this._server.addQueuedUserConnection(this);
    };

    readyHandler = (ready: boolean) => {
        console.log("user " + (ready ? "" : "not " ) + "ready");
        this._server.userReady(this, ready);
    };
}