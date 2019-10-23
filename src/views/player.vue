<template>
    <div class="p-wrap">
        <div style="margin:10px 0">
            <el-button type="primary" @click="keepLiveVideo">开始直播</el-button>
            <el-button type="primary" @click="stopLiveVideo">停止直播</el-button>
        </div>
        <video ref="player" id="video1" width="640" height="480" poster="http://pic34.nipic.com/20131030/2455348_194508648000_2.jpg" controls @pause="handlePause" @play="handlePlay"></video>
    </div>
</template>
<script>
export default {
    data() {
        return {
            player: null,
        }
    },
    mounted() {

    },
    methods: {
        keepLiveVideo() {
            if (Wfs.isSupported() && this.player === null) {
                this.player = new Wfs()
                this.player.attachMedia(this.$refs.player, 'ch1', 'H264Raw', 'play2/2222/2', '112.5.154.242:61161');

            }
        },
        stopLiveVideo() {
            this.$refs.player.pause();
            if (this.player) {
                this.player.destroy();
                this.player = null;
            }
        },
        handlePause() {
            if (this.player) {
                this.player.destroy();
                this.player = null;
            }
        },
        handlePlay() {
            if (!this.player) {
                if (Wfs.isSupported()) {
                    this.player = new Wfs()
                    this.player.attachMedia(this.$refs.player, 'ch1', 'H264Raw', 'play2/2222/2', '112.5.154.242:61161');
                }
            }
        },
    }
}
</script>