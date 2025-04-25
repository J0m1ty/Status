import { ProcessStatus } from "../../../backend/src/api";

type EventCallback = (data: ProcessStatus[]) => void;

export class EventService {
    public static PATH = '/api/events';

    private eventSource: EventSource | null = null;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private retryCount = 0;
    private onDataCallback: EventCallback | null = null;
    private onStatusCallback: ((loading: boolean) => void) | null = null;

    public connect() {
        if (this.eventSource) {
            this.eventSource.close();
        }

        this.setLoading(true);
        this.eventSource = new EventSource(EventService.PATH);
        
        this.eventSource.addEventListener('status', this.handleStatusEvent);
        this.eventSource.addEventListener('error', this.handleError);
    }

    public disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
    }

    public setCallbacks(dataCallback: EventCallback, statusCallback: (loading: boolean) => void) {
        this.onDataCallback = dataCallback;
        this.onStatusCallback = statusCallback;
    }

    private handleStatusEvent = (e: Event) => {
        try {
            const data = JSON.parse((e as MessageEvent).data) as ProcessStatus[];
            this.onDataCallback?.(data);
            this.retryCount = 0;
            this.setLoading(false);
        } catch (err) {
            console.error('Error parsing SSE data:', err);
        }
    }

    private handleError = () => {
        if (this.eventSource?.readyState === EventSource.CLOSED) {
            this.setLoading(true);
            this.retryCount++;
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
            }
            this.reconnectTimeout = setTimeout(() => {
                this.connect();
            }, Math.min(1000 * Math.pow(2, this.retryCount), 30000));
        }
    }

    private setLoading(loading: boolean) {
        this.onStatusCallback?.(loading);
    }
}

export const eventService = new EventService();