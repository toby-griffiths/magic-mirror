/**
 * Base client context class to extend other types from
 */
export abstract class ClientContext {

    // -----------------------------------------------------------------------------------------------------------------
    // Initialisation methods
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @constructor
     * @param {string} _el
     * @param {SocketIOClient.Socket} _socket
     */
    constructor(private _el: string, private _socket: SocketIOClient.Socket, private _connectionId: string) {
    }

    /**
     * Initialises the main Vue component
     *
     * @param {string} el Element selector
     */
    public init(): void {
        this.addSocketEventHandlers(this._socket);
        this.initialiseVue(this._el);
        this.addVueEventHandlers();
    }

    /**
     * Should add socket message event handlers
     *
     * @param {SocketIOClient.Socket} socket
     */
    protected abstract addSocketEventHandlers(socket: SocketIOClient.Socket): void;

    /**
     * Should initialise the Vue
     *
     * @param {string} el Element selector string
     */
    protected abstract initialiseVue(el: string): void;

    /**
     * Should add event handlers for Vue
     */
    protected abstract addVueEventHandlers(): void;

    // -----------------------------------------------------------------------------------------------------------------
    // Event handlers
    // -----------------------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------------------
    // Helper methods
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Send message to socket connection
     *
     * @param args
     */
    public emit(...args: any[]) {
        console.log("Triggering: " + args[0], args.slice(1));
        this._socket.emit.apply(this._socket, args);
    }
}