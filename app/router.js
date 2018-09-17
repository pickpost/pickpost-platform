'use strict';

module.exports = app => {
  const { router, controller } = app;
  // RESTful APIs
  router.get('/api/projects', controller.project.projectsIndex);
  router.get('/api/projects/:id', controller.project.projectsShow);
  router.post('/api/projects', controller.project.projectsNew);
  router.delete('/api/projects/:id', controller.project.projectsDestroy);
  router.put('/api/projects/:id', controller.project.projectsUpdate);
  router.get('/api/projectList', controller.project.projectList);

  router.get('/api/collections', controller.collection.collectionsIndex);
  router.get('/api/collections/:id', controller.collection.collectionsShow);
  router.post('/api/collections', controller.collection.collectionsNew);
  router.delete('/api/collections/:id', controller.collection.collectionsDestroy);
  router.put('/api/collections/:id', controller.collection.collectionsUpdate);

  router.get('/api/apis', controller.api.apisIndex);
  router.post('/api/apis', controller.api.apisNew);
  router.delete('/api/apis/:id', controller.api.apisDestroy);
  router.get('/api/apis/:id', controller.api.apisShow);
  router.put('/api/apis/:id', controller.api.apisUpdate);
  router.post('/api/apisUnlink', controller.api.apisUnlink);

  router.get('/api/search', controller.api.searchByKeyWord);
  router.get('/api/getuser', controller.api.getUser);
  router.get('/api/globalsearch', controller.api.globalSearch);

  // View Testing Start
  router.get('/api/folder', controller.folder.folderIndex);
  router.get('/api/folder/:id', controller.folder.folderShow);
  router.post('/api/folder', controller.folder.folderNew);
  router.delete('/api/folder/:id', controller.folder.folderDestroy);
  router.put('/api/folder/:id', controller.folder.folderUpdate);

  router.get('/api/file', controller.file.fileIndex);
  router.post('/api/file', controller.file.fileNew);
  router.delete('/api/file/:id', controller.file.fileDestroy);
  router.get('/api/file/:id', controller.file.fileShow);
  router.put('/api/file/:id', controller.file.fileUpdate);
  // View Testing End

  const jsonp = app.jsonp();
  // Mock API
  router.all('/mock/:project/**', jsonp, controller.proxy.mockapi);
  router.all('/mockjsonp/:project/**', jsonp, controller.proxy.mockapi); // To be deprecated

  // Proxy API
  router.all('/auth', controller.proxy.auth);
  router.all('/proxy', controller.proxy.proxy);

  // SocketIO
  // router.io.of('/socket2').route('ping2', router.io.controller.socket.index);

  // 跨域支持
  router.all('/proxy.html', controller.home.proxy);

  // 页面路由
  router.get('/', controller.home.index);
  router.get('*', controller.home.app);
};
