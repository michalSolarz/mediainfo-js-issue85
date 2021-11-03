import { Component } from '@angular/core';
import MediaInfoFactory from 'mediainfo.js';
import { MediaInfo, ReadChunkFunc, Result } from 'mediainfo.js/dist/types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  videoInfo = 'No file'

  getMetadata(mediainfo: MediaInfo, fileinput: EventTarget | null): Promise<string> {
    if (fileinput===null) {
      return Promise.reject('empty file input');
    }
    const input = fileinput;
    return new Promise<string>((resolve) => {
      const files = (input as HTMLInputElement).files || [];
      const file = files[0];
      if (!file) {
        return resolve('Can\'t get media information')
      }

      const getSize = () => file.size
      const readChunk: ReadChunkFunc = (chunkSize, offset) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (event: ProgressEvent<FileReader>) => {
            const target = event.target;
            if (null===target) {
              reject('empty target')
            }
            if (target?.error) {
              reject(target.error)
            }
            resolve(new Uint8Array(target?.result as ArrayBuffer))
          }
          reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
        })
      const p = <Promise<Result>>mediainfo.analyzeData(getSize, readChunk)
      // @ts-ignore
      p.then((result: string) => resolve(result)).catch(() =>
        resolve('Can\'t get media information')
      )
    })
  }

  onChangeFile(input: EventTarget | null): void {
    MediaInfoFactory({format: 'text'}, (mediainfo: MediaInfo) => {
      this.getMetadata(mediainfo, input).then((info) => {
        this.videoInfo = info.replace(/(?:\r\n|\r|\n)/g, '<br>')
      })
    })
  }
}
