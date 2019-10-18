<template>
    <div class="p-wrap">
        <!-- <div style="margin:10px 0">
            <el-button type="primary" @click="keepLiveVideo">点击链接</el-button>
            <el-button type="primary" @click="stopLiveVideo">断开链接</el-button>
        </div>
        <video controls ref="video"></video> -->
        <video id="video1" width="640" height="480" controls></video>
        <!-- <video id="video2" width="320" height="240" controls></video>
        <video id="video3" width="320" height="240" controls></video>
        <video id="video4" width="320" height="240" controls></video>
        <video id="video5" width="320" height="240" controls></video>
        <video id="video6" width="320" height="240" controls></video> -->
    </div>
</template>
<script>
import * as API from 'api/player';
import WS from 'service/webSocket';
import SlicesReader from 'service/h264-nal-slicesreader';
export default {
    data() {
        return {
            playList: {},
            mediaSource: null,
            sourceBuffer: null,
            mimeCodec: 'video/mp4; codecs=avc1.420028',
            queue: [],
            slicesReader: null,
        }
    },
    mounted() {
        this.slicesReader = new SlicesReader(this);
        if (Wfs.isSupported()) {
            var video1 = document.getElementById("video1"),
                wfs = new Wfs();
            wfs.attachMedia(video1, 'ch1');

            // var video2 = document.getElementById("video2"),
            //     wfs2 = new Wfs();
            // wfs2.attachMedia(video2, 'ch2');

            // var video3 = document.getElementById("video3"),
            //     wfs3 = new Wfs();
            // wfs3.attachMedia(video3, 'ch3');

            // var video4 = document.getElementById("video4"),
            //     wfs4 = new Wfs();
            // wfs4.attachMedia(video4, 'ch4');

            // var video5 = document.getElementById("video5"),
            //     wfs5 = new Wfs();
            // wfs5.attachMedia(video5, 'ch5');

            // var video6 = document.getElementById("video6"),
            //     wfs6 = new Wfs();
            // wfs6.attachMedia(video6, 'ch6');
        }
    },
    methods: {
        keepLiveVideo() {
            this.$refs.video.play();
            if ('MediaSource' in window && MediaSource.isTypeSupported(this.mimeCodec)) {
                this.mediaSource = new MediaSource();
                this.$refs.video.src = URL.createObjectURL(this.mediaSource);
                this.mediaSource.addEventListener('sourceopen', this.sourceOpen);
            } else {
                console.error('Unsupported MIME type or codec: ', this.mimeCodec);
            }
        },
        sourceOpen() {
            console.log('sourceopen')
            const successHandle = function (res) {
                if (typeof res.data !== 'string') {
                    const reader = new FileReader();
                    reader.readAsArrayBuffer(res.data);
                    reader.onload = (e) => {
                        const buffer = new Uint8Array(reader.result);
                        this.slicesReader.H264DataParsing(buffer)
                    }
                }
            }
            const orgin = 'ws://112.5.154.243:61161/play2';
            const params = {
                sim: '2222',
                channel: '2',
            }
            this.playList['2222_2'] = new WS(orgin, params, successHandle.bind(this));
            this.sourceBuffer = this.mediaSource.addSourceBuffer(this.mimeCodec);
            this.sourceBuffer.addEventListener('update', this.update);
            this.sourceBuffer.addEventListener('updateend', this.updateend);
            this.sourceBuffer.onerror = e => {
                console.log(e)
            }
        },
        updateend() {
            console.log('updateend')
            console.log(this.queue)
            console.log(this.mediaSource.readyState); // ended
            // this.mediaSource.endOfStream();
        },
        update() {
            console.log('update')
            console.log(this.queue)
            if (this.queue.length > 0 && !this.sourceBuffer.updating) {
                console.log(this.queue.shift())
                this.sourceBuffer.appendBuffer(this.queue.shift());
            }
        },
        appendBuffer(data) {
            if (this.sourceBuffer.updating || this.mediaSource.readyState != "open" || this.queue.length > 0) {
                this.queue.push(data);
            } else {
                this.sourceBuffer.appendBuffer(data);
            }
        },
        stopLiveVideo() {
            if (this.playList['2222_2']) {
                this.playList['2222_2'].stop();
            }
            this.$refs.video.pause();
        }
    }
}
</script>