import {Connection} from "../../server/connection/Connection";
import {ConnectionType} from "../../server.old/connection/Connection";

/**
 * Connection to host (mirror) device used to send socket messages back & forth
 */
export class HostConnection extends Connection {

    /**
     * Returns a friendly connection type string
     *
     * @return {string}
     */
    getType(): ConnectionType {
        return "host";
    }
}