<template>
    <div class="p-wrap">
        <div style="margin:10px 0">
            <el-button type="primary" @click="keepLiveVideo">开始直播</el-button>
            <el-button type="primary" @click="stopLiveVideo">停止直播</el-button>
        </div>
        <video ref="ch1" id="video1" width="640" height="480" controls></video>
    </div>
</template>
<script>
export default {
    data() {
        return {
            player:{},
        }
    },
    mounted() {
        
    },
    methods: {
        keepLiveVideo(){
            if (Wfs.isSupported()) {
                this.player.ch1=new Wfs()
                this.player.ch1.attachMedia(this.$refs.ch1, 'ch1','H264Raw','play2/2222/2','112.5.154.242:61161');
            }
            
        },
        stopLiveVideo(){
            if(this.player.ch1){
                this.player.ch1.destroy();
            }
        }
    }
}
</script>