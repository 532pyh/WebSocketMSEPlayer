/*
 * Flow Controller
*/

class FlowController {
    constructor(vm) {
        this.vm = vm;
        this.fileStart = 0;
        this.fileEnd = 0;
        this.pendingAppending = 0;
        this.mediaType = undefined;
        this.segments = [];
        // channelName: this.channelName;
    }

    onMediaAttached(data) {
        if (data.websocketName != undefined) {
            var client = new WebSocket('ws://' + window.location.host + '/' + data.websocketName);
            // this.wfs.attachWebsocket(client, data.channelName);
        } else {
            console.log('websocketName ERROE!!!');
        }

    }

    onBufferCreated(data) {
        this.mediaType = data.mediaType;
    }

    onFileHeadLoaded(data) {
    }

    onFileDataLoaded(data) {
    }

    onFileParsingData(data) {
    }

    onWebsocketAttached(data) {
        // this.wfs.trigger(Event.BUFFER_APPENDING, { type: 'video', data: data.payload, parent: 'main' });
    }

    onFragParsingInitSegment(data) {
        var tracks = data.tracks, trackName, track;

        track = tracks.video;
        if (track) {
            track.id = data.id;
        }

        for (trackName in tracks) {
            track = tracks[trackName];
            var initSegment = track.initSegment;
            if (initSegment) {
                this.pendingAppending++;
                //this.wfs.trigger(Event.BUFFER_APPENDING, { type: trackName, data: initSegment, parent: 'main' });
            }
        }

    }

    onFragParsingData(data) {

        if (data.type === 'video') {

        }

        [data.data1, data.data2].forEach(buffer => {
            if (buffer) {
                this.pendingAppending++;
                // this.wfs.trigger(Event.BUFFER_APPENDING, { type: data.type, data: buffer, parent: 'main' });
                const obj = {
                    type: data.type,
                    data: buffer,
                    parent: 'main'
                }
                if (!this.segments) {
                    this.segments = [obj];
                } else {
                    this.segments.push(obj);
                }
                this.doAppending();
            }
        });

    }
    doAppending() {
        var segments = this.segments;
        if (segments && segments.length) {
            var segment = segments.shift();
            this.vm.appendBuffer(segment.data)
            // try {
            //     if (sourceBuffer[segment.type]) {
            //         this.parent = segment.parent;
            //         sourceBuffer[segment.type].appendBuffer(segment.data);
            //         this.appendError = 0;
            //         this.appended++;
            //         this.appending = true;
            //     } else {

            //     }
            // } catch (err) {
            //     // in case any error occured while appending, put back segment in segments table 
            //     segments.unshift(segment);
            //     var event = { type: ErrorTypes.MEDIA_ERROR };
            //     if (err.code !== 22) {
            //         if (this.appendError) {
            //             this.appendError++;
            //         } else {
            //             this.appendError = 1;
            //         }
            //         event.details = ErrorDetails.BUFFER_APPEND_ERROR;
            //         event.frag = this.fragCurrent;
            //         if (this.appendError > wfs.config.appendErrorMaxRetry) {
            //             segments = [];
            //             event.fatal = true;
            //             return;
            //         } else {
            //             event.fatal = false;
            //         }
            //     } else {
            //         this.segments = [];
            //         event.details = ErrorDetails.BUFFER_FULL_ERROR;
            //         return;
            //     }
            // }

        }
    }

}
export default FlowController;  