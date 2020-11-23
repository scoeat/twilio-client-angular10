

import { Component, OnInit } from '@angular/core';
import { Device, Connection  } from 'twilio-client';
import { getJSON  } from 'jquery';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'twilio-client-angular';

  device = new Device();
  speakerDevices: any;
  ringtoneDevices: any;
  outputVolumeBar: any;
  inputVolumeBar: any;
  volumeIndicators: any;
  tokenURL = 'https://rosewood-chihuahua-9290.twil.io/access-token';
  toNumber = '14062731759';
  fromNumber = '17603163595';
  callerName = 'Scott';
  constructor( private http: HttpClient )
   { }

   ngOnInit(): void {

      this.clientSetup();
     }

  clientSetup(): any {
    this.speakerDevices = document.getElementById('speaker-devices');
    this.ringtoneDevices = document.getElementById('ringtone-devices');
    this.outputVolumeBar = document.getElementById('output-volume');
    this.inputVolumeBar = document.getElementById('input-volume');
    this.volumeIndicators = document.getElementById('volume-indicators');


    this.log('Requesting Capability Token...');
    this.http.get<any>(this.tokenURL).subscribe(data => {
      // console.log(data);
      this.log('Got a token.');
      this.log('Token: ' + data.token);

      // Setup this.device
      this.device.setup(data.token);

      this.device.on('ready', client => {
        this.log('Device Ready!');
        document.getElementById('call-controls').style.display = 'block';
      });

      this.device.on('error', error => {
        this.log('this.device Error: ' + error.message);
      });

      this.device.connect( conn => {
        this.log('Successfully established call!');
        document.getElementById('button-call').style.display = 'none';
        document.getElementById('button-hangup').style.display = 'inline';
        this.volumeIndicators.style.display = 'block';
        this.bindVolumeIndicators(conn);
      });

      this.device.on('disconnect', connection => {
        this.log('Call ended.');
        document.getElementById('button-call').style.display = 'inline';
        document.getElementById('button-hangup').style.display = 'none';
        this.volumeIndicators.style.display = 'none';
      });

      this.device.on('incoming', connection => {
        this.log('Incoming connection from ' + connection.parameters.From);
        const archEnemyPhoneNumber = '+12099517118';

        if (connection.parameters.From === archEnemyPhoneNumber) {
          connection.reject();
          this.log('It\'s your nemesis. Rejected call.');
        } else {
          // accept the incoming connection and start two-way audio
          connection.accept();
        }
      });


      this.device.audio.on('deviceChange', deviceCjhange => {
        this.updateAllDevices();
      });

      // Show audio selection UI if it is supported by the browser.
      if (this.device.audio.isOutputSelectionSupported) {
        document.getElementById('output-selection').style.display = 'block';
      }
    });
    }

    // Bind button to make call    clientSetup(): void {
      makeCall(): any {
      // get the phone number to connect the call to
      const params = {
        To: this.toNumber,
        ThisCallerID: this.fromNumber
      };
      this.log('Calling ' + params.To + '...');
      this.device.connect(params);
    }

    // Bind button to hangup call
    hangUp(): any {
      this.log('Hanging up...');
      this.device.disconnectAll();
    }

    getDevices(): any {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(this.updateAllDevices());
    }

    changeSpeaker(event): any {
      const selectedDevices = [].slice.call(this.speakerDevices.children)
        .filter((node) => node.selected )
        .map((node) => node.getAttribute('data-id'));
      this.device.audio.speakerDevices.set(selectedDevices);
    }

    changeMic(event): any {
      const selectedDevices = [].slice.call(this.ringtoneDevices.children)
        .filter((node) => node.selected)
        .map((node) => node.getAttribute('data-id'));
      this.device.audio.ringtoneDevices.set(selectedDevices);
    }

    bindVolumeIndicators(connection): any {
      connection.volume((inputVolume, outputVolume) => {
        let inputColor = 'red';
        if (inputVolume < .50) {
          inputColor = 'green';
        } else if (inputVolume < .75) {
          inputColor = 'yellow';
        }

        this.inputVolumeBar.style.width = Math.floor(inputVolume * 300) + 'px';
        this.inputVolumeBar.style.background = inputColor;

        let outputColor = 'red';
        if (outputVolume < .50) {
          outputColor = 'green';
        } else if (outputVolume < .75) {
          outputColor = 'yellow';
        }

        this.outputVolumeBar.style.width = Math.floor(outputVolume * 300) + 'px';
        this.outputVolumeBar.style.background = outputColor;
      });
    }

    updateAllDevices(): any {
      this.updateDevices(this.speakerDevices, this.device.audio.speakerDevices.get());
      this.updateDevices(this.ringtoneDevices, this.device.audio.ringtoneDevices.get());
    }



// Update the available ringtone and speaker devices
  updateDevices(selectEl, selectedDevices): any {
  selectEl.innerHTML = '';
  this.device.audio.availableOutputDevices.forEach((device, id) => {
    let isActive = (selectedDevices.size === 0 && id === 'default');
    selectedDevices.forEach((selected) => {
      if (selected.deviceId === id) { isActive = true; }
    });
    const option = document.createElement('option');
    option.label = device.label;
    option.setAttribute('data-id', id);
    if (isActive) {
      option.setAttribute('selected', 'selected');
    }
    selectEl.appendChild(option);
  });
}

// Activity log
 log(message): any {
  const logDiv = document.getElementById('log');
  logDiv.innerHTML += '<p>&gt;&nbsp;' + message + '</p>';
  logDiv.scrollTop = logDiv.scrollHeight;
}

// Set the client name in the UI
setClientNameUI(clientName): any {
  const div = document.getElementById('client-name');
  div.innerHTML = 'Your client name: <strong>' + clientName +
    '</strong>';
}

}
