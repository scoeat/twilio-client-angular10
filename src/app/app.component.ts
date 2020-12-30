

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

  myappid = 'eyJraWQiOiJHODh6T1Q4NlhjTDNVSEFNTGpYQ0pMXC9ZQTFLaDA5WVRcL3VJaUo2Q3FEcVU9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI4ZTUwNjMxMi01OGQxLTQxY2YtOWE0OC1jNmVkNWY2ZTc2YzQiLCJkZXZpY2Vfa2V5IjoidXMtd2VzdC0yXzlhOTc0NDY3LTEyNzEtNGRlZC1hNDVjLWMwNTgzNTZhZDhlYyIsImNvZ25pdG86Z3JvdXBzIjpbImZzX2FwaSJdLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNjA1MTgyMTEzLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl83Z0xLUGJ2aWciLCJleHAiOjE2MDUyNDM2MDUsImlhdCI6MTYwNTI0MDAwNSwianRpIjoiZjAyYjZhZjUtMzU1ZS00M2ExLThlMDQtYzE3MjU4N2U1ZTYzIiwiY2xpZW50X2lkIjoiMnFiM25pZ3J0Nzc1amc1cTAxNHFxbG00NnUiLCJ1c2VybmFtZSI6InNjb3R0In0.R1mSQY41C1mUc_ez7BaaSucpGhtTdSoiffaH-nKP6qHJnc9DXR09lkGdfbQu8WbWLQW83VGj8P2xB6ic99yLiLY8iByLtNGtCFkCEXGlz6CH82-D6aGYueOIYD_Z2TfWuTlAYdJ-iPHB2HgLPcHc7AzX32ojeQBw5rU3eE_Db1d6frACqiX92VKTtiE_QWP1qQH1fmnded7qKZG6uud27iN6-oHxiGeaI1-U0026bxN7V5u62NQChqjOBI6eyfAYEsOE-KGlvp2A4BQWkvXIvZyuiEW-htluVfh9dWO8rhu_bZkAoJJ-Upw2CS98GVpGPSLGGyB-G0J5tjz7TBJ5mw';
  callerName = 'Scott';
  // params = new URLSearchParams({
  //   identity: "newID"
  // });
  // private _headers = new HttpHeaders().set('Content-Type', 'application/json');
  // tokenURL = 'https://kcum4n60l3.execute-api.us-west-2.amazonaws.com/test/accesstoken?'+this.params.toString();
  tokenURL = 'https://kcum4n60l3.execute-api.us-west-2.amazonaws.com/test/accesstoken';
  toNumber = '14062731759';
  fromNumber = '17603163595';
  constructor( private http: HttpClient )
   { }

   ngOnInit(): void {
// console.log(this.tokenURL);
      // this.clientSetup();
     }

  clientSetup(): any {
    this.speakerDevices = document.getElementById('speaker-devices');
    this.ringtoneDevices = document.getElementById('ringtone-devices');
    this.outputVolumeBar = document.getElementById('output-volume');
    this.inputVolumeBar = document.getElementById('input-volume');
    this.volumeIndicators = document.getElementById('volume-indicators');


    this.log('Requesting Access Token...');
    // const headers = new HttpHeaders().set('Content-Type', 'application/json')
    // headers = this._headers.append({'myappid': this.myappid,'client': this.callerName});
    // this.http.get<any>(this.tokenURL, { headers : headers }).subscribe(data => {
      this.http.get<any>(this.tokenURL, { 
        headers : {'authorization' : this.myappid},
        params: {'clientname' : this.callerName}
      }).subscribe(data => {
        // console.log(data);
        this.log('Got a token.');
        this.log('Token: ' + data.token);

        // Setup this.device
        this.device.setup(data.token);

        this.device.on('ready', client => {
          console.log('Device Ready!');
          console.log(client)
          this.log('Device Ready!');
          document.getElementById('call-controls').style.display = 'block';
        });

        this.device.on('error', error => {
          this.log('this.device Error: ' + error.message);
        });

        this.device.connect( conn => {
          console.log('Successfully established call!');
          console.log(conn)
          this.log('Successfully established call!');
          document.getElementById('button-call').style.display = 'none';
          document.getElementById('button-hangup').style.display = 'inline';
          this.volumeIndicators.style.display = 'block';
          this.bindVolumeIndicators(conn);
        });

        this.device.on('disconnect', connection => {
          console.log('Call ended.');
          console.log(connection)
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


        this.device.audio.on('deviceChange', deviceChange => {
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
