import {Injectable} from "@angular/core";
import {Specification} from "ngx-typeschema-editor";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private documents: Array<Document> = [];

  public loadFromStorage() {
    const rawDocuments = localStorage.getItem('documents');
    if (rawDocuments) {
      this.documents = JSON.parse(rawDocuments);
    }
  }

  public getAll(): Array<Document> {
    return this.documents;
  }

  public get(index: number): Document|undefined {
    return this.documents[index];
  }

  public create(name: string): number {
    const spec = {
      imports: [],
      operations: [],
      types: [{
        name: name,
        description: '',
        type: 'struct',
        properties: [],
      }],
      root: 0,
    };

    const index = this.documents.push({
      name: name,
      spec: spec,
    });

    this.persist();

    return index - 1;
  }

  public update(index: number, spec: Specification) {
    if (!this.documents[index]) {
      return;
    }

    this.documents[index].spec = spec;

    this.persist();
  }

  public delete(index: number) {
    if (!this.documents[index]) {
      return;
    }

    delete this.documents[index];

    this.persist();
  }

  public persist() {
    localStorage.setItem('documents', JSON.stringify(this.documents));
  }

}

export interface Document {
  name: string;
  spec: Specification;
}
