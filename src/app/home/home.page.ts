import { Component, ChangeDetectorRef } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Share } from '@capacitor/share';
// import { BLE } from '@awesome-cordova-plugins/ble/ngx';
import { BleClient, BluetoothLe } from '@capacitor-community/bluetooth-le';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  image = '';
  myImage = '';
  // eslint-disable-next-line @typescript-eslint/type-annotation-spacing
  position:any;
  devices: any[] = [];
  ble = false;
  scanText = '';
  constructor(private change: ChangeDetectorRef) {
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnInit(){
    BleClient.initialize().then(() => {
      BleClient.isEnabled().then((res)=> {
        console.log(res);
        if(res) {
          this.ble = true;
        } else {
          this.ble = false;
        }

      });
    });
  };

  toggleBle(event){
    if(this.ble) {
      this.enableBluetooth();
    } else {
      this.disableBluetooth();
    }
  }
  enableBluetooth() {
    BleClient.enable();
  }

  disableBluetooth(){
    BleClient.disable();
  }

  startScanning(){
    this.scanText = 'Scanning...';
    BleClient.requestLEScan({allowDuplicates : false}, (res1) => {
      console.log(res1);
      if(res1.localName) {
        this.devices.push(res1);
        this.change.detectChanges();
      }
      console.log(this.devices);
    });
    setTimeout(() => {
      console.log('Hi');
      console.log(this.devices);
      this.stopScanning();
    },20000);
  }

  stopScanning(){
    BluetoothLe.stopLEScan().then(() => {
      this.scanText = '';
    });
  }
  connect(device, index){
    BleClient.connect(device.device.deviceId).then(() => {
      this.devices[index].connection = true;
      this.change.detectChanges();
      alert('Connected');
    }, (err) => {
      alert(err);
    });
  }

  disconnect(device, index) {
    BleClient.connect(device.device.deviceId).then(() => {
      this.devices[index].connection = false;
      this.change.detectChanges();
      alert('Disconnected');
    });
  }

  async captureImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      source: CameraSource.Prompt,
      resultType: CameraResultType.Base64
    });

    if (image) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.myImage = `data:image/jpeg;base64,${image.base64String}`!;
    }
  }

  async getCurrentPosition() {
    const coordinates = await Geolocation.getCurrentPosition();

    this.position = coordinates;
  }

  async share() {
    await Share.share({
      title: 'Come and find me',
      text: `Here's my current location: 
        ${this.position.coords.latitude}, 
        ${this.position.coords.longitude}`,
      url: 'http://ionicacademy.com/'
    });
  }



}
