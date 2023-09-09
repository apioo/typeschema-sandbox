import { Component } from '@angular/core';
import {ExportService, Specification} from "ngx-typeschema-editor";

@Component({
  selector: 'app-sandbox',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.css']
})
export class SandboxComponent {

  spec: Specification = {
    imports: [],
    operations: [],
    types: [],
  };

  preview?: string

  constructor(private exportService: ExportService) { }

  change(spec: Specification) {
    this.preview = JSON.stringify(this.exportService.transform(spec), null, 2);
  }

}
