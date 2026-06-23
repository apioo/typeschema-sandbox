import {Component, OnInit, signal} from '@angular/core';
import {ExportService, Specification, TypeschemaEditorModule} from "ngx-typeschema-editor";
import {Document, DocumentService} from "../service/document.service";
import {NgClass} from "@angular/common";
import {EditorComponent} from "ngx-monaco-editor-v2";
import {FormsModule} from "@angular/forms";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-sandbox',
  templateUrl: './sandbox.component.html',
  imports: [
    TypeschemaEditorModule,
    NgClass,
    EditorComponent,
    FormsModule
  ],
  styleUrls: ['./sandbox.component.css']
})
export class SandboxComponent implements OnInit {

  spec = signal<Specification>({
    imports: [],
    operations: [],
    types: [],
  });

  preview = signal<string>('');
  selected = signal<number>(-1);
  documents = signal<Array<Document>>([]);

  type = signal<string>('model-typescript');
  types = signal<Array<Type>>([]);

  constructor(private documentService: DocumentService, private exportService: ExportService, private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.documentService.loadFromStorage();
    this.load();
    this.loadTypes();

    if (this.selected() === -1 && this.documents().length > 0) {
      this.select(0);
    }
  }

  load() {
    this.documents.set(this.documentService.getAll());
  }

  loadTypes() {
    this.httpClient.get<Collection>('https://api.sdkgen.app/types').subscribe((collection) => {
      this.types.set(collection.types.filter((type) => {
        return type.name.startsWith('model-');
      }));
    });
  }

  select(index: number) {
    const document = this.documentService.get(index);
    if (!document) {
      return;
    }

    this.selected.set(index);
    this.spec.set(document.spec);
    this.preview.set(JSON.stringify(this.exportService.transform(document.spec), null, 2));
  }

  new() {
    const name = prompt('Document name');
    if (!name) {
      return;
    }

    const index = this.documentService.create(name);

    this.load();
    this.select(index);
  }

  change(spec: Specification) {
    this.documentService.update(this.selected(), spec);
    this.preview.set(JSON.stringify(this.exportService.transform(spec), null, 2));
  }

  export() {
    const type = this.type();
    const spec = this.spec();
    if (!type || !spec) {
      return;
    }

    const json = this.exportService.transform(spec);

    this.httpClient.post('https://api.sdkgen.app/download/' + type, json, {responseType: 'blob'}).subscribe({
      next: (data: Blob) => {
        const downloadUrl = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = this.getFileNameByType(type);
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(downloadUrl);
      },
      error: (error) => {
        alert('Download failed: ' + error);
      }
    });
  }

  private getFileNameByType(type: string) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const dateSuffix = `${year}-${month}-${day}-${hours}-${minutes}`;

    let extension = 'zip';
    if (type === 'markup-client') {
      extension = 'ts';
    } else if (type === 'markup-html') {
      extension = 'html';
    } else if (type === 'markup-markdown') {
      extension = 'md';
    } else if (type.startsWith('model-jsonschema')) {
      extension = 'json';
    } else if (type === 'spec-graphql') {
      extension = 'graphql';
    } else if (type === 'spec-openapi' || type === 'spec-openrpc' || type === 'spec-typeapi') {
      extension = 'json';
    }

    return `sdk-${dateSuffix}.${extension}`;
  }

}

interface Collection {
  types: Array<Type>
}

interface Type {
  name: string,
  fileExtension: string,
  mime: string,
}
