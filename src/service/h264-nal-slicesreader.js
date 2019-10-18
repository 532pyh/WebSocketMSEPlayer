/*
 * H264 NAL Slicer
 */
import h264Demuxer from './h264-demuxer';
class SlicesReader {
    constructor(vm) {
        this.vm=vm;
        this.lastBuf = null;
        this.nals = [];
        this.h264Demuxer = new h264Demuxer(this.vm);
    }

    destroy() {
        this.lastBuf = null;
        this.nals = [];
    }

    _read(buffer) {
        let typedAr = null;
        this.nals = [];
        if (!buffer || buffer.byteLength < 1) return;
        if (this.lastBuf) {
            typedAr = new Uint8Array(buffer.byteLength + this.lastBuf.length);
            typedAr.set(this.lastBuf);
            typedAr.set(new Uint8Array(buffer), this.lastBuf.length);
        } else {
            typedAr = new Uint8Array(buffer);
        }
        let lastNalEndPos = 0;
        let b1 = -1; // byte before one
        let b2 = -2; // byte before two
        let nalStartPos = new Array();
        for (let i = 0; i < typedAr.length; i += 2) {
            let b_0 = typedAr[i];
            let b_1 = typedAr[i + 1];
            if (b1 == 0 && b_0 == 0 && b_1 == 0) {
                nalStartPos.push(i - 1);
            } else if (b_1 == 1 && b_0 == 0 && b1 == 0 && b2 == 0) {
                nalStartPos.push(i - 2);
            }
            b2 = b_0;
            b1 = b_1;
        }
        if (nalStartPos.length > 1) {
            for (let i = 0; i < nalStartPos.length - 1; ++i) {
                this.nals.push(typedAr.subarray(nalStartPos[i], nalStartPos[i + 1] + 1));
                lastNalEndPos = nalStartPos[i + 1];
            }
        } else {
            lastNalEndPos = nalStartPos[0];
        }
        if (lastNalEndPos != 0 && lastNalEndPos < typedAr.length) {
            this.lastBuf = typedAr.subarray(lastNalEndPos);
        } else {
            if ( !! !this.lastBuf) {
                this.lastBuf = typedAr;
            }
            var _newBuf = new Uint8Array(this.lastBuf.length + buffer.byteLength);
            _newBuf.set(this.lastBuf);
            _newBuf.set(new Uint8Array(buffer), this.lastBuf.length);
            this.lastBuf = _newBuf;
        }
    }

	H264DataParsing(data) {
		this._read(data);
		this.nals.forEach(item =>{
            this.h264Demuxer.H264DataParsed(item)
		});
	}

}

export default SlicesReader;