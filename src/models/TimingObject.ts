import * as mongoose from "mongoose";


export type TimingObjectDocument = mongoose.Document & {
    _totalRecords: number;
    _dataLoadTime: number;
    _dataRenderTime: number;
    _displayTime: number;
    _totalTime: number;
    _description: string;
    _timePerRecord: string;
}

const timingObjectSchema = new mongoose.Schema(
    {
        _totalRecords: Number,
        _dataLoadTime: Number,
        _dataRenderTime: Number,
        _displayTime: Number,
        _totalTime: Number,
        _description: String,
        _timePerRecord: Number,
    }, {timestamps: true}
);

export const TimingObject = mongoose.model<TimingObjectDocument>("timingObject", timingObjectSchema);
