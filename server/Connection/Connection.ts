import {Server} from "../../server/Server";

/**
 * Base class for all socket connection types
 *
 * Connections handle sending & receiving of socket messages
 */
export abstract class Connection {

    private _id: string;

    /**
     * Friendly connection name
     */
    private _friendlyName: string;

    /**
     * Should return the type of the connection
     */
    abstract getType(): ConnectionType;

    /**
     * @constructor
     * @param {Server} _server
     * @param {SocketIO.Socket} _socket
     */
    constructor(protected _server: Server, private _socket: SocketIO.Socket) {
        console.log("a " + this.getType() + " connected from " + _socket.client.conn.remoteAddress);

        this._id = _socket.client.conn.id;

        this._socket.on(Events.Disconnect, () => {
            this._server.dropConnection(this);
            this._server.emitToHosts(Events.LostUser);
        });

        this.emit(Events.ClientType, this.getType(), this.id);
    }


    public init(): void {

        this._socket.emit(Events.Reset);

        this._socket.on(Events.ConnectionFriendlyName, this.setFriendlyNameHandler);

        this._socket.on(Events.DumpQueues, this.dumpQueuesHansler);

        this.addHandlers(this._socket);
    }

    /**
     * Should implement all connection type specific handlers
     *
     * @param {SocketIO.Socket} socket
     */
    protected abstract addHandlers(socket: SocketIO.Socket);

    /**
     * Disconnects the socket connection
     */
    public disconnect(): void {
        // Don't drop the connection, otherwise the client may try to reconnect
        this._socket.disconnect(false);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Passthru method for socket.emit()
     */
    public emit(...args) {
        console.log("Triggering " + args[0] + " on " + this.getIdentifierString(), args.slice(1));
        this._socket.emit.apply(this._socket, args);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Event handlers
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Event: {Events.ConnectionFriendlyName}
     *
     * @param {string} name
     */
    setFriendlyNameHandler = (name: string): void => {
        console.log("Setting friendly name (" + name + ") for connection " + this._id);
        this._friendlyName = name;
    };

    dumpQueuesHansler = (): void => {
        this._server.dumpAllQueues();
    };

    // -----------------------------------------------------------------------------------------------------------------
    // Getters & Setters
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    get id(): string {
        return this._id;
    }

    /**
     * Returns the connection friendly name, if available, otherwise returns the conneciton ID
     *
     * @return {string}
     */
    getIdentifierString(): string {
        if (this._friendlyName) {
            return this._friendlyName + " - " + this._id;
        }

        return this._id;
    }
}

export type ConnectionType = "host" | "user";

export const Events = {
    Connect: "connection",
    Reset: "reset",
    ID: "id",
    ConnectionFriendlyName: "connectionName",
    ClientType: "clientType",
    JoinQueue: "joinQueue",
    QueuePosition: "queuePosition",
    Ready: "ready",
    ReadyTimer: "readyTimer",
    Timeout: "timeout",
    LostUser: "lostUser",
    Activate: "activate",
    Welcome: "welcome",
    Categories: "categories",
    CategorySelected: "categorySelected",
    Answers: "answers",
    Fortune: "fortune",
    MirrorOffline: "mirrorOffline",
    Disconnect: "disconnect",
    DumpQueues: "dumpQueues",
};