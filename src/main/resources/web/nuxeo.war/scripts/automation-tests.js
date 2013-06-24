function createAndReadDocs(cb) {

  var root = {};
  var children = [];

  var failedCB = function(xhr, status, msg) {
    alert(msg)
  };

  var testSuite = [];

  var nextTest = function() {
    var targetTest = testSuite.shift();
    if (targetTest) {
      targetTest();
    }
  }

  var createOp = jQuery()
      .automation(
          "Document.Create",
          {
            automationParams : {
              params : {
                type : "Folder",
                name : "TestFolder1",
                properties : "dc:title=Test Folder2 \ndc:description=Simmple container"
              },
              input : "doc:/"
            }
          });

  var createRoot = function() {
    var createdOK = function(doc, status, xhr) {
      root = doc;
      ok( doc.uid, "created container with uid : " + doc.uid );
      nextTest();
    };

    createOp.execute(createdOK, failedCB);
  };

  testSuite.push(createRoot);

  var createChild1 = function() {

    createdOK = function(doc, status, xhr) {
      ok( (doc.uid!=null) && (doc.path.indexOf(root.path)==0), "created file with uid : " + doc.uid + " and path " + doc.path );
      children.push(doc);
      nextTest();
    };

    createOp = jQuery().automation("Document.Create", {
      automationParams : {
        params : {
          type : "File",
          name : "TestFile1"
        },
        input : "doc:" + root.path
      }
    });

    createOp.execute(createdOK, failedCB);

  };

  testSuite.push(createChild1);

  var createChild2 = function() {

    createOp.addParameter("name", "TestFile2");
    createOp.execute(createdOK, failedCB);

  };

  testSuite.push(createChild2);

  var updateChild2 = function() {

    var updatedOK = function(doc, status, xhr) {
      ok(doc.properties['dc:description']=="Simple File", "description updated ok " + doc.properties['dc:description']);
      ok(doc.properties['dc:subjects'].length==2, "subject updated ok " + doc.properties['dc:subjects']);
      nextTest();
    };

    var updateOp = jQuery()
        .automation(
            "Document.Update",
            {
              automationParams : {
                params : {
                  save : "true",
                  properties : "dc:description=Simple File\ndc:subjects=subject1,subject2"
                },
                input : "doc:" + children[1].path
              }
            });

    updateOp.execute(updatedOK, failedCB);

  };

  testSuite.push(updateChild2);

  var getChildren = function() {

      var displayChildren = function(docs, status, xhr) {
        ok(docs.entries.length==2, "2 children");
        nextTest();
      };

      var getChildren = jQuery()
          .automation(
              "Document.GetChildren",
              {
                automationParams : {
                  input : "doc:" + root.path
                }
              });

      getChildren.execute(displayChildren, failedCB);

    };

  testSuite.push(getChildren);

  if (cb) {
    testSuite.push(cb);
  }
  nextTest();
}

asyncTest( "Create and read docs test", function() {
    createAndReadDocs(function() {
      ok( true, "Passed CRUD Tests" );
      start();
    });
});
