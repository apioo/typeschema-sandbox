import { Component } from '@angular/core';
import {ExportService, Specification, TypeschemaEditorModule} from "ngx-typeschema-editor";
import {Highlight} from "ngx-highlightjs";

@Component({
  selector: 'app-sandbox',
  templateUrl: './sandbox.component.html',
  imports: [
    TypeschemaEditorModule,
    Highlight
  ],
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
