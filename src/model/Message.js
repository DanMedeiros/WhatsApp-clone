import { Firebase } from '../util/Firebase';
import { Model } from './Model';
import { Format } from '../util/Format';
import { Upload } from '../util/Upload';

export class Message extends Model{

    constructor(){
        super();

    }

    get id() { return this._data.id; }
    set id(value) { return this._data.id = value; }

    get content() { return this._data.content; }
    set content(value) { return this._data.content = value; }

    get type() { return this._data.type; }
    set type(value) { return this._data.type = value; }

    get timeStamp() { return this._data.timeStamp; }
    set timeStamp(value) { return this._data.timeStamp = value; }

    get status() { return this._data.status; }
    set status(value) { return this._data.status = value; }

    get preview() { return this._data.preview; }
    set preview(value) { return this._data.preview = value; }

    get info() { return this._data.info; }
    set info(value) { return this._data.info = value; }

    get fileType() { return this._data.fileType; }
    set fileType(value) { return this._data.fileType = value; }

    get size() { return this._data.size; }
    set size(value) { return this._data.size = value; }

    get from() { return this._data.from; }
    set from(value) { return this._data.from = value; }

    get filename() { return this._data.filename; }
    set filename(value) { return this._data.filename = value; }

    get photo() { return this._data.photo; }
    set photo(value) { return this._data.photo = value; }

    get duration() { return this._data.duration; }
    set duration(value) { return this._data.duration = value; }

    getViewElement(me = true) {

        let div = document.createElement('div');

        div.id = `_${this.id}`;

        div.className = 'message';

        switch(this.type) {

            case 'contact':
                div.innerHTML = `
                
                `;

                if(this.content.photo){
                    let img = div.querySelector('.photo-contact-sended');
                    img.src = this.content.photo;
                    img.show();
                }

            break;

            case 'image' :
                div.innerHTML = `
                
                `;

                div.querySelector('.message-photo').on('load', e => {

                    div.querySelector('.message-photo').show();
                    div.querySelector('._340lu').hide();
                    div.querySelector('._3v3PK').css({

                        height : 'auto'

                    });

                });
            break;

            case 'document' :
                div.innerHTML = `
                
                `;
            break;

            case 'audio' :
                div.innerHTML = `
                
                `;

                if(this.photo) {

                    let img = div.querySelector('.message-photo');
                    img.src = this.photo;
                    img.show();

                }

                let audioEl = div.querySelector('audio');
                let loadEl = div.querySelector('.audio-load');
                let btnPlay = div.querySelector('.audio-play');
                let btnPause = div.querySelector('.audio-pause');
                let inputRange = div.querySelector('[type=range]');
                let audioDuration = div.querySelector('.message-audio-duration');

                audioEl.onloadeddata = e => {

                    loadEl.hide();
                    btnPlay.show();

                }

                audioEl.onplay = e => {

                    btnPlay.hide();
                    btnPause.show();

                }

                audioEl.onpause = e => {

                    audioDuration.innerHTML = Format.toTime(this.duration * 1000)
                    btnPlay.show();
                    btnPause.hide();

                }

                audioEl.onended = e => {

                    audioEl.currentTime = 0;

                }

                audioEl.ontimeupdate = e => {

                    btnPlay.hide();
                    btnPause.hide();

                    audioDuration.innerHTML = Format.toTime(audioEl.currentTime * 1000);
                    inputRange.value = (audioEl.currentTime * 100) / this.duration;

                    if(audioEl.paused) {

                        btnPlay.show();

                    } else {

                        btnPause.show();

                    }
                }

                btnPlay.on('click', e => {

                    audioEl.play();

                });

                
                btnPause.on('click', e => {

                    audioEl.pause();

                });

                inputRange.on('change', e => {

                    audioEl.currentTime = (inputRange.value * this.duration) / 100;


                });
                
            break

            default:
                div.innerHTML = `
                
                `;
        }

        let className = 'message-in';

        if(me) {

            className = 'message-out';

            div.querySelector('.message-time').parentElement.appendChild(this.getStatusViewElement());

        }

        div.firstElementChild.classList.add(className);

        return div;
    }

    static upload(file, from) {

        return Upload.send(file, from);

    }

    static sendContact(chatId, from, contact) {

        return Message.send(chatId, from, 'contact', contact);

    }

    static sendAudio(chatId, from, file, metadata, photo){

        return Message.send(chatId, from, 'audio', '').then(msgRef => {

            Message.upload(file, from).then(snapshot => {

                let downloadFile = snapshot.downloadURL;

                msgRef.set({
                    content : downloadFile,
                    size : file.size,
                    fileType: file.type,
                    status: 'sent',
                    photo,
                    duration: metadata.duration
                }, {
                    merge: true
                });

            });

        });

    }

    static sendDocument(chatId, from, file, filePreview, info){

        Message.send(chatId, from, 'document', '').then(msgRef => {

            Message.upload(file, from).then(snapshot => {

                let downloadFile = snapshot.downloadURL;

                if(filePreview) {

                    Message.upload(filePreview).then(snapshot2 => {

                        let downloadPreview = snapshot2.downloadURL;
    
                        msgRef.set({
                            content : downloadFile,
                            preview: downloadPreview,
                            filename : file.name,
                            size : file.size,
                            fileType: file.type,
                            status: 'sent',
                            info
                        }, {
                            merge: true
                        });
    
                    });

                } else {

                    msgRef.set({
                        content : downloadFile,
                        preview: downloadPreview,
                        filename : file.name,
                        size : file.size,
                        fileType: file.type,
                        status: 'sent'
                    }, {
                        merge: true
                    });

                };

            });

        });

    }

    static sendImage(chatId, from, file) {

        return new Promise ((s, f) => {

            Message.upload(file. from).then(snapshot => {

                Message.send(
                    chatId,
                    from,
                    'image',
                    snapshot.downloadURL
                ).then(() => {

                    s();

                });

            });

        });

    }

    static send(chatId, from, type, content){

        return new Promise((s, f) => {

            Message.getRef(chatId).add({
                content,
                timeStamp: new Date(0),
                status: 'wait',
                type,
                from
            }).then(result => {

                let docRef = result.parent.doc(result.id);

                docRef.set({

                    status: 'sent'

                }, {

                    merge : true

                }).then(() => {

                    s(docRef);
                    
                });

            })

        });

    }

    static getRef(chatId) {

        return Firebase.db()
            .collection('chats')
            .doc(chatId)
            .collection('messages');

    }

    getStatusViewElement() {

        let div = document.createElement('div');

        div.className = 'message-status'

        switch(this.status) {

            case 'wait':
                div.innerHTML = `
                    <span data-icon="msg-time">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 15" width="16" height="15">
                            <path fill="#859479" d="M9.75 7.713H8.244V5.359a.5.5 0 0 0-.5-.5H7.65a.5.5 0 0 0-.5.5v2.947a.5.5 0 0 0 .5.5h.094l.003-.001.003.002h2a.5.5 0 0 0 .5-.5v-.094a.5.5 0 0 0-.5-.5zm0-5.263h-3.5c-1.82 0-3.3 1.48-3.3 3.3v3.5c0 1.82 1.48 3.3 3.3 3.3h3.5c1.82 0 3.3-1.48 3.3-3.3v-3.5c0-1.82-1.48-3.3-3.3-3.3zm2 6.8a2 2 0 0 1-2 2h-3.5a2 2 0 0 1-2-2v-3.5a2 2 0 0 1 2-2h3.5a2 2 0 0 1 2 2v3.5z"></path>
                        </svg>
                    </span>
                `;
            break

            case 'sent':
                div.innerHTML = `
                    <span data-icon="msg-check">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 15" width="16" height="15">
                            <path fill="#FFF" d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path>
                        </svg>
                    </span>
                `;
            break

            case 'received':
                div.innerHTML = `
                <span data-icon="msg-dblcheck">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 15" width="16" height="15">
                        <path fill="#92A58C" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path>
                    </svg>
                </span>
                `;
            break

            case 'read': 
                div.innerHTML = `
                    <span data-icon="msg-dblcheck-ack">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 15" width="16" height="15">
                            <path fill="#4FC3F7" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path>
                        </svg>
                    </span>
                `;
            break

        }

        return div;

    }

}