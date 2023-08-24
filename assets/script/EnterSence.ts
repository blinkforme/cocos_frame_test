import { Component, Label, ProgressBar, Sprite, _decorator } from "cc";


const { ccclass, property } = _decorator;
@ccclass('EnterSence')
export class EnterSence extends Component {
    @property({ type: Sprite, tooltip: '背景图' })
    bgImg: Sprite;

    @property({ type: ProgressBar, tooltip: '进度条' })
    progressBar: ProgressBar;

    @property({ type: Label, tooltip: '进度' })
    txtPro: Label;

    onLoad(): void {

    }
}