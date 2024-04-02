import { ItemView, WorkspaceLeaf, Plugin,MarkdownView, PluginSettingTab,Notice,TFile  } from 'obsidian';


export const SidePanelControlViewType = 'TemplateButtonSideBar';

export class SidePanelControlView extends ItemView {
  plugin: Plugin;

  constructor(leaf: WorkspaceLeaf, plugin: Plugin) {
    super(leaf);
    this.plugin = plugin;
  }

  public getViewType(): string {
    return SidePanelControlViewType;
  }

  public getDisplayText(): string {
    return 'Template Button In Sidebar';
  }

  public getIcon(): string {
    return 'tv';
  }

  public async load(): Promise<void> {
    await super.load();
    this.draw();
    await this.displayMdFileNames();
  }

  private draw(): void {
    const container = this.containerEl.children[1];
    const rootEl = document.createElement('div');
    rootEl.id = 'SidePaneRootElement';
    rootEl.textContent = 'Template Button In Sidebar';
    rootEl.style.marginBottom = '20px'; // 아래쪽 여백 20px 추가

    container.empty();
    container.appendChild(rootEl);
  }

  private async displayMdFileNames(): Promise<void> {
    const folder = this.plugin.settings.templateFolder;
    const files = this.app.vault.getFiles().filter(file => file.path.startsWith(folder) && file.extension === 'md');
    

    // 경로명을 표시할 컨테이너 생성 및 스타일 설정
    const pathDisplay = document.createElement('div');
    pathDisplay.textContent = `${folder}`;
    pathDisplay.style.borderTop = '1px solid #ccc';
    pathDisplay.style.padding = '5px 10px';
    pathDisplay.style.fontSize = '25px'; // 글자 크기를 50px로 설정
    pathDisplay.style.textOverflow = 'ellipsis';
    pathDisplay.style.overflow = 'hidden';
    this.containerEl.children[1].appendChild(pathDisplay);

    const listContainer = document.createElement('div');
    listContainer.id = 'mdFileListContainer';
    listContainer.style.borderTop = '1px solid #ccc';
    listContainer.style.borderBottom = '1px solid #ccc';
    this.containerEl.children[1].appendChild(listContainer);


    files.forEach((file, index) => {
      const fileNameWithoutExtension = file.name.replace(/\.md$/, ''); // 확장자 제거
      
      const fileEntry = document.createElement('div');
      fileEntry.classList.add('file-entry');
      fileEntry.style.display = 'flex';
      fileEntry.style.justifyContent = 'space-between';
      fileEntry.style.alignItems = 'center';
      fileEntry.style.padding = '5px 10px';
      fileEntry.style.overflow = 'hidden';
      fileEntry.style.whiteSpace = 'nowrap';

      const fileNameDisplay = document.createElement('span');
      fileNameDisplay.textContent = fileNameWithoutExtension;
      fileNameDisplay.style.textOverflow = 'ellipsis';
      fileNameDisplay.style.overflow = 'hidden';
      fileEntry.appendChild(fileNameDisplay);

      const buttonContainer = document.createElement('div');
      fileEntry.appendChild(buttonContainer);

      const insertButton = document.createElement('button');
      insertButton.textContent = 'Insert';
      insertButton.style.marginLeft = '10px';
      insertButton.style.backgroundColor = 'purple';
      insertButton.style.color = 'white';
      insertButton.style.padding = '5px 8px';
      insertButton.style.width = '100px';
      insertButton.style.flexGrow = '1.5';

      // 호버 상태일 때 글자색을 검정으로 변경
      insertButton.onmouseover = () => {
        insertButton.style.backgroundColor = 'white';
        insertButton.style.color = 'black'; // 글자색 변경
      };

      // 마우스가 버튼에서 벗어났을 때 원래 스타일로 복귀
      insertButton.onmouseout = () => {
        insertButton.style.backgroundColor = 'purple';
        insertButton.style.color = 'white';
      };

      // 버튼 클릭 시 실행될 함수
      insertButton.onclick = ((currentFile) => async () => {
        // 스타일 변경
        insertButton.style.backgroundColor = 'black';
        insertButton.style.color = 'white';
        
        // 파일 내용 읽기
        const templateContent = await this.app.vault.read(currentFile);
        
        // 모든 열려있는 뷰를 순회하여 활성 마크다운 편집기 찾기
        let activeEditor;
        this.app.workspace.iterateAllLeaves((leaf) => {
          if (leaf.view instanceof MarkdownView) {
            activeEditor = leaf.view.editor;
          }
        });

        if (activeEditor) {
          const cursorPosition = activeEditor.getCursor(); // 현재 커서 위치 얻기
      
          // 템플릿 내용 삽입
          activeEditor.replaceRange(templateContent, cursorPosition);
      
          // 삽입된 내용을 기준으로 새 커서 위치 계산
          const lines = templateContent.split('\n');
          const newCursorLine = cursorPosition.line + lines.length - 1;
          let newCursorCh = cursorPosition.ch;
          if (lines.length === 1) {
            newCursorCh += templateContent.length;
          } else {
            newCursorCh = lines[lines.length - 1].length;
          }
      
          // 새 커서 위치로 이동
          activeEditor.setCursor({ line: newCursorLine, ch: newCursorCh });
          activeEditor.focus();
        } else {
          console.log("활성 편집기를 찾을 수 없습니다.");
        }
      })(file);

      
      


      buttonContainer.appendChild(insertButton);

      // Create 버튼 스타일 및 이벤트 핸들러 설정
      const createButton = document.createElement('button');
      createButton.textContent = 'Create';
      createButton.style.marginLeft = '5px';
      createButton.style.backgroundColor = '#d3d3d3'; // 기본 배경색을 밝은 회색으로 설정
      createButton.style.color = 'black'; // 기본 글자색을 검정으로 설정
      createButton.style.padding = '5px 8px';
      createButton.style.width = '60px';
      createButton.style.flexGrow = '1.5';

      // 호버 상태일 때 배경색과 글자색 변경
      createButton.onmouseover = () => {
        createButton.style.backgroundColor = 'white';
        createButton.style.color = 'black';
      };

      // 마우스가 버튼에서 벗어났을 때 원래 스타일로 복귀
      createButton.onmouseout = () => {
        createButton.style.backgroundColor = '#d3d3d3';
        createButton.style.color = 'black';
      };

      createButton.onclick = async () => {
        const fileContent = await this.app.vault.read(file); // 템플릿 파일 내용 읽기
        const newFileName = `New From Template.md`; // 새 파일명 생성
        this.app.vault.create(newFileName, fileContent); // 새 파일 생성 및 템플릿 내용으로 채우기
      };

      buttonContainer.appendChild(createButton);

      fileEntry.appendChild(buttonContainer);
      listContainer.appendChild(fileEntry);
    });
  }
}