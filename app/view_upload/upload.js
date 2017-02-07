'use strict';

angular.module('graphrecipes.view_upload', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/upload', {
    templateUrl: 'view_upload/upload.html',
    controller: 'UploadCtrl'
  });
}])

.controller('UploadCtrl', ['droppable', '$scope', 'FileLoader', 'store', '$location', '$timeout', '$http'
, function(                 droppable ,  $scope ,  FileLoader ,  store ,  $location ,  $timeout ,  $http) {

  $scope.dropClass
  $scope.loadingMessage = ''


  // File loading interactions
  $scope.loadFile = function(){
    document.querySelector('input#hidden-file-input').click()
  }

  $scope.setFile = function(element) {
    var file = element.files[0]
    $scope.readFile(file)
  }

  $scope.readFile = function(file){
    store.set('graphname', file.name.replace(/\.[^\.]*$/, ''))
    var fileLoader = new FileLoader()
    fileLoader.read(file, {
      onloadstart: function(evt){
        $scope.loadingMessage = 'UPLOADING...'
        $scope.dropClass = 'loading'
        $scope.$apply()
      }
      ,onprogress: function(evt){
        // evt is a ProgressEvent
        if (evt.lengthComputable) {
          $scope.loadingMessage = 'UPLOADING ' + Math.round((evt.loaded / evt.total) * 100) + '%'
          $scope.$apply()
        }
      }
      ,onload: function(evt){
        var target = evt.target || evt.srcElement
        
        if (target.result) {
          var gexf_dom
          try {
            gexf_dom = new DOMParser().parseFromString(target.result, "application/xml")
          } catch(e) {
            parsingFail()
          }
          if (gexf_dom) {
            var g
            try {
              var gexf_json = gexf.parse(gexf_dom)
              
              g = new graphology.Graph()

              gexf_json.nodes.forEach(function(n){
                g.addNode(n.id, n.attributes)
              })

              gexf_json.edges.forEach(function(e){
                g.addEdge(e.source, e.target, e.attributes)
              })

            } catch(e) {
              parsingFail()
            }
            if(g) {
              store.set('graph', g)
              parsingSuccess()
            } else {
              parsingFail()
            }
          } else {
            parsingFail()
          }
        } else {
          parsingFail()
        }
      }
    })
  }

  $scope.loadExample = function (dataUrl) {
    $scope.loadingMessage = 'LOADING...'
    store.set('graphname', dataUrl.replace(/\.[^\.]*$/, ''))
    $http.get(dataUrl).then(function (data) {
      $timeout(function(){
        var gexf_dom
        try {
          gexf_dom = new DOMParser().parseFromString(data.data, "application/xml")
        } catch(e) {
          parsingFail()
        }
        if (gexf_dom) {
          var g
          try {
            var gexf_json = gexf.parse(gexf_dom)
            
            g = new graphology.Graph()

            gexf_json.nodes.forEach(function(n){
              var attributes = n.attributes
              attributes.x = n.viz.position.x
              attributes.y = n.viz.position.y
              attributes.color = n.viz.color
              attributes.label = n.label
              attributes.size = n.size
              g.addNode(n.id, attributes)
            })

            gexf_json.edges.forEach(function(e){
              g.addEdge(e.source, e.target, e.attributes)
            })
          } catch(e) {
            parsingFail()
          }
          if(g) {
            store.set('graph', g)
            parsingSuccess()
          } else {
            parsingFail()
          }
        }
      })
    }, function(){
      parsingFail()
    })
  }

  function parsingSuccess() {
    $scope.loadingMessage = 'PARSED'
    $scope.dropClass = 'success'
    $scope.$apply()
    $timeout(function(){
      $location.url('/board')
    }, 250)
  }
  function parsingFail() {
    $scope.loadingMessage = 'CANNOT PARSE'
    $scope.dropClass = 'error'
    $scope.$apply()
  }

  // Make the text area droppable
  droppable(document.getElementById("uploader"), $scope, $scope.readFile)
}])

.factory('FileLoader', ['$window', function(win){
  return function(){
    this.read = function(file, settings){
      this.reader = new FileReader()

      // Settings
      if(settings.onerror === undefined)
        this.reader.onerror = this.errorHandler
      else
        this.reader.onerror = settings.onerror

      if(settings.onprogress === undefined)
        this.reader.onprogress = function(evt) {
          console.log('file loader: progress ', evt)
        }
      else
        this.reader.onprogress = settings.onprogress

      if(settings.onabort === undefined)
        this.reader.onabort = function(e) {
          alert('File read cancelled')
        }
      else
        this.reader.onabort = settings.onabort

      if(settings.onloadstart === undefined)
        this.reader.onloadstart = function(evt) {
          console.log('file loader: Load start ', evt)
        }
      else
        this.reader.onloadstart = settings.onloadstart

      if(settings.onload === undefined)
        this.reader.onload = function(evt) {
          console.log('file loader: Loading complete ', evt)
        }
      else
        this.reader.onload = settings.onload
      
      this.reader.readAsText(file)
    }

    this.abortRead = function(){
        this.reader.abort()
    }

    this.reader = undefined
    
    this.errorHandler = function(evt){
      var target = evt.target || evt.srcElement
      switch(target.error.code) {
        case target.error.NOT_FOUND_ERR:
          alert('File Not Found!')
          break
        case target.error.NOT_READABLE_ERR:
          alert('File is not readable')
          break
        case target.error.ABORT_ERR:
          break // noop
        default:
          alert('An error occurred reading this file.');
      }
    }
  }
}])

.factory('store', [function(){
  var savedData = {}
  
  function set(key, data){
    savedData[key] = data
  }
  function get(key){
    return savedData[key]
  }
  function remove(key){
    return delete savedData[key]
  }

  return {
    set: set
    ,get: get
    ,remove: remove
  }
}])

.factory('droppable', [function(){
  return function(droppable, $scope, callback){
    //============== DRAG & DROP =============
    // adapted from http://jsfiddle.net/danielzen/utp7j/

    // init event handlers
    function dragEnterLeave(evt) {
      evt.stopPropagation()
      evt.preventDefault()
      $scope.$apply(function(){
        $scope.dropClass = ''
      })
    }
    droppable.addEventListener("dragenter", dragEnterLeave, false)
    droppable.addEventListener("dragleave", dragEnterLeave, false)
    droppable.addEventListener("dragover", function(evt) {
      evt.stopPropagation()
      evt.preventDefault()
      var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0
      $scope.$apply(function(){
        $scope.dropClass = ok ? 'over' : 'over-error'
      })
    }, false)
    droppable.addEventListener("drop", function(evt) {
      // console.log('drop evt:', JSON.parse(JSON.stringify(evt.dataTransfer)))
      evt.stopPropagation()
      evt.preventDefault()
      $scope.$apply(function(){
        $scope.dropClass = 'over'
      })
      var files = evt.dataTransfer.files
      if (files.length == 1) {
        $scope.$apply(function(){
          callback(files[0])
          $scope.dropClass = ''
        })
      }
    }, false)
  }
}])