
document.addEventListener('DOMContentLoaded', function() {
 
  function maskCPF(v){ return v.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2'); }
  function maskPhone(v){ return v.replace(/\D/g,'').replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d{4})$/,'$1-$2'); }
  function maskCEP(v){ return v.replace(/\D/g,'').replace(/(\d{5})(\d{3})$/,'$1-$2'); }

  const cpf = document.querySelector('#cpf');
  const phone = document.querySelector('#telefone') || document.querySelector('#telefone') || document.querySelector('#telefone');
  const telefone = document.querySelector('#telefone') || document.querySelector('#telefone');
  const cep = document.querySelector('#cep');

  if(cpf){ cpf.addEventListener('input', (e)=> e.target.value = maskCPF(e.target.value)); }
  if(telefone){ telefone.addEventListener('input', (e)=> e.target.value = maskPhone(e.target.value)); }
  if(cep){ cep.addEventListener('input', (e)=> e.target.value = maskCEP(e.target.value)); }

  
  const cadastroForm = document.querySelector('#cadastroForm');
  if(cadastroForm){
    cadastroForm.addEventListener('submit', function(ev){
      ev.preventDefault();
      if(!cadastroForm.checkValidity()){
        cadastroForm.reportValidity(); return;
      }
      const data = new FormData(cadastroForm);
      const obj = Object.fromEntries(data.entries());
      const list = JSON.parse(localStorage.getItem('volunteers')||'[]');
      list.push(obj);
      localStorage.setItem('volunteers', JSON.stringify(list));
      alert('Cadastro salvo! Obrigado por se inscrever.');
      cadastroForm.reset();
      updateAdminCounts();
    });
  }

  function defaultProjects(){
    return [
      {id:1, title:'Projeto Alimenta Esperança', desc:'Distribuição de cestas básicas e apoio alimentar.', indicators:'120 famílias atendidas', img:'images/projeto1.svg'},
      {id:2, title:'Educar é Transformar', desc:'Reforço escolar e cursos de informática.', indicators:'200 alunos por ano', img:'images/projeto2.svg'}
    ];
  }

  function loadProjects(){
    const p = JSON.parse(localStorage.getItem('projects') || 'null');
    if(!p){ localStorage.setItem('projects', JSON.stringify(defaultProjects())); return defaultProjects(); }
    return p;
  }

  function saveProjects(arr){ localStorage.setItem('projects', JSON.stringify(arr)); }

  // Render projects on projetos.html
  const projectsContainer = document.querySelector('#projectsContainer');
  if(projectsContainer){
    const projects = loadProjects();
    const template = document.querySelector('#projectTemplate');
    projects.forEach(proj => {
      const node = template.content.cloneNode(true);
      node.querySelector('.proj-title').textContent = proj.title;
      node.querySelector('.proj-desc').textContent = proj.desc;
      node.querySelector('.proj-ind').textContent = proj.indicators;
      node.querySelector('img').src = proj.img;
      const applyBtn = node.querySelector('.apply-btn');
      applyBtn.addEventListener('click', ()=> openApplyModal(proj));
      const viewBtn = node.querySelector('.view-btn');
      viewBtn.addEventListener('click', ()=> openViewModal(proj));
      projectsContainer.appendChild(node);
    });
  }


  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  if(modal){
    modal.addEventListener('click', (e)=>{
      if(e.target === modal || e.target.classList.contains('modal-close')) closeModal();
    });
  }
  function openModal(html){
    modalBody.innerHTML = html;
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); modalBody.innerHTML=''; }

  function openViewModal(proj){
    const html = `<h3>${proj.title}</h3><p>${proj.desc}</p><p><strong>Indicadores:</strong> ${proj.indicators}</p>`;
    openModal(html);
  }
  function openApplyModal(proj){
    const html = `<h3>Candidatar-se: ${proj.title}</h3>
      <form id="applyForm">
        <label for="a-name">Nome completo</label>
        <input id="a-name" name="name" required>
        <label for="a-email">E-mail</label>
        <input id="a-email" name="email" type="email" required>
        <button type="submit" class="btn">Enviar candidatura</button>
      </form>`;
    openModal(html);
    document.getElementById('applyForm').addEventListener('submit', function(e){
      e.preventDefault();
      const name = document.getElementById('a-name').value;
      const email = document.getElementById('a-email').value;
      const apps = JSON.parse(localStorage.getItem('applications')||'[]');
      apps.push({projectId:proj.id, name, email, date:new Date().toISOString()});
      localStorage.setItem('applications', JSON.stringify(apps));
      alert('Candidatura enviada!');
      closeModal();
      updateAdminCounts();
    });
  }

  const projectForm = document.querySelector('#projectForm');
  if(projectForm){
    projectForm.addEventListener('submit', function(e){
      e.preventDefault();
      const title = document.getElementById('p-title').value;
      const desc = document.getElementById('p-desc').value;
      const ind = document.getElementById('p-ind').value;
      const projects = loadProjects();
      const id = projects.length? Math.max(...projects.map(p=>p.id))+1 : 1;
      projects.push({id, title, desc, indicators:ind, img:'images/projeto1.svg'});
      saveProjects(projects);
      projectForm.reset();
      renderAdminProjects();
      alert('Projeto salvo.');
      updateAdminCounts();
    });
    renderAdminProjects();
  }

  function renderAdminProjects(){
    const cont = document.getElementById('adminProjects');
    const projects = loadProjects();
    cont.innerHTML='';
    projects.forEach(p=>{
      const div = document.createElement('div');
      div.className='project-card';
      div.innerHTML = `<h4>${p.title}</h4><p>${p.desc}</p><p><strong>Indicadores:</strong> ${p.indicators}</p>
        <button class="btn edit">Editar</button> <button class="btn remove">Remover</button>`;
      div.querySelector('.remove').addEventListener('click', ()=>{
        if(confirm('Remover projeto?')){
          const ps = projects.filter(x=>x.id!==p.id);
          saveProjects(ps); renderAdminProjects(); updateAdminCounts();
        }
      });
      div.querySelector('.edit').addEventListener('click', ()=>{
        document.getElementById('p-title').value = p.title;
        document.getElementById('p-desc').value = p.desc;
        document.getElementById('p-ind').value = p.indicators;
        const ps = projects.filter(x=>x.id!==p.id);
        saveProjects(ps); renderAdminProjects(); 
      });
      cont.appendChild(div);
    });
  }

  
  const btnDonate = document.getElementById('btnDonate');
  const progressBar = document.getElementById('progressBar');
  if(btnDonate){
    btnDonate.addEventListener('click', ()=>{
      const current = parseInt(progressBar.style.width) || 0;
      const newPercent = Math.min(100, current + 5); 
      progressBar.style.width = newPercent + '%';
      const totalDon = parseFloat(localStorage.getItem('totalDon')||'0') + 50;
      localStorage.setItem('totalDon', totalDon);
      updateAdminCounts();
      alert('Doação simulada de R$50 recebida. Obrigado!');
    });
  }

  
  function updateAdminCounts(){
    const projects = JSON.parse(localStorage.getItem('projects')||'[]');
    const vols = JSON.parse(localStorage.getItem('volunteers')||'[]');
    const apps = JSON.parse(localStorage.getItem('applications')||'[]');
    const totalDon = parseFloat(localStorage.getItem('totalDon')||'0');
    const elProj = document.getElementById('totalProjects');
    const elVol = document.getElementById('totalVols');
    const elDon = document.getElementById('totalDon');
    if(elProj) elProj.textContent = projects.length;
    if(elVol) elVol.textContent = vols.length + (apps? apps.length:0);
    if(elDon) elDon.textContent = totalDon.toFixed(2);
  }
  updateAdminCounts();

  
  if(document.getElementById('adminProjects')) renderAdminProjects();
});
