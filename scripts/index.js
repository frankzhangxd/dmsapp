var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);

// PhoneGap is loaded and it is now safe to make calls PhoneGap methods
/*
function onDeviceReady() {
    navigator.network.isReachable("google.com", reachableCallback, {});
}
*/
(function ($) {

console.log('Synchronize...');
synchronize();    
    
function synchronize(){
    initDatabase();
    //users
    $.getJSON(serviceURL + 'getData', {table:"users"}, function(data) {
  		users = data.items;
        DEMODB.transaction(
            function (transaction) {
                transaction.executeSql("DELETE FROM users WHERE 1", [] , function (t, r) {
       	            $.each(users, function(index, user) {
                        transaction.executeSql("INSERT INTO users(id, password, fname, lname, email, position) VALUES (?, ?, ?, ?, ?, ?)", [user.id, user.password, user.fname, user.lname, user.email, user.position]);
       	            })
                }, function (t, e) {console.log(e.message);}); 
       	    });
   	});
    
    //users_projects
    $.getJSON(serviceURL + 'getData', {table:"users_to_projects"}, function(data) {
  		ups = data.items;
        DEMODB.transaction(
            function (transaction) {
                transaction.executeSql("DELETE FROM users_to_projects WHERE 1", [] , function (t, r) {
       	            $.each(ups, function(index, user) {
                        transaction.executeSql("INSERT INTO users_to_projects(id, user_id, project_id) VALUES (?, ?, ?)", [user.up_id, user.user_id, user.project_id]);
       	            })
                }, function (t, e) {console.log(e.message);
            }); 
   	    });
   	});
    
    //projects
    $.getJSON(serviceURL + 'getData', {table:"projects"}, function(data) {
  		projects = data.items;
        DEMODB.transaction(
            function (transaction) {
                transaction.executeSql("DELETE FROM projects WHERE 1", [] , function (t, r) {
       	            $.each(projects, function(index, user) {
                        transaction.executeSql("INSERT INTO projects(project_id, name, shortname, cat, project_scope) VALUES (?, ?, ?, ?, ?)", [user.project_id, user.name, user.shortname, user.cat, user.project_scope]);
       	            })
                }, function (t, e) {console.log(e.message);
            }); 
   	    });
   	});
    
    //project_jobcodes
    $.getJSON(serviceURL + 'getProjectContracts', {}, function(data) {
  		jobcodes = data.items;
        DEMODB.transaction(
            function (transaction) {
                transaction.executeSql("DELETE FROM project_jobcodes WHERE 1", [] , function (t, r) {
       	            $.each(jobcodes, function(index, user) {
                        transaction.executeSql("INSERT INTO project_jobcodes(project_id, jobcode, cat) VALUES (?, ?, ?)", [user.project_id, user.description, 'ORG']);
       	            })
                }, function (t, e) {console.log(e.message);
            }); 
   	    });
   	});  
    $.getJSON(serviceURL + 'getProjectsChangeOrders', {}, function(data) {
  		cos = data.items;
        DEMODB.transaction(
            function (transaction) {
                $.each(cos, function(index, user) {
                    transaction.executeSql("INSERT INTO project_jobcodes(project_id, jobcode, cat) VALUES (?, ?, ?)", [user.project_id, user.description, 'CHG']);
   	            }) 
   	    });
   	}); 
    
    //project_materials
    $.getJSON(serviceURL + 'getData', {table:"project_materials"}, function(data) {
  		materials = data.items;
        DEMODB.transaction(
            function (transaction) {
                transaction.executeSql("DELETE FROM project_materials WHERE 1", [] , function (t, r) {
                    console.log('update job materials');
       	            $.each(materials, function(index, user) {
                        transaction.executeSql("INSERT INTO project_materials(category, item, uom, cat) VALUES (?, ?, ?, ?)", [user.category, user.item, user.uom, user.cat]);
       	            })
                }, function (t, e) {console.log(e.message);
            }); 
   	    }, function(err){alert('error code'+ err.message);}, function(){console.log('Your database has been updated');});
   	});   
    
    //project_timesheet_workers
    $.getJSON(serviceURL + 'getData', {table:"project_timesheet_workers"}, function(data) {
  		workers = data.items;
        DEMODB.transaction(
            function (transaction) {
                transaction.executeSql("DELETE FROM project_timesheet_workers WHERE 1", [] , function (t, r) {
       	            $.each(workers, function(index, user) {
                        transaction.executeSql("INSERT INTO project_timesheet_workers(project_id, user_id, worker, jobtitle) VALUES (?, ?, ?, ?)", [user.project_id, user.user_id, user.worker_name, user.jobtitle]);
       	            })
                }, function (t, e) {console.log(e.message);
            }); 
   	    });
   	});
}
  
function initDatabase() {
    try {
        createTables();
    } catch(e) {
        if (e == 2) {
            // Version number mismatch.
            console.log("Invalid database version.");
        } else {
            console.log("Unknown error "+e+".");
        }
        return;
    }
}
    
function createTables(){
    DEMODB.transaction(
        function (transaction) {
       	    transaction.executeSql('CREATE TABLE IF NOT EXISTS users (id INTEGER NOT NULL PRIMARY KEY, password TEXT NOT NULL, fname TEXT NOT NULL, lname TEXT NOT NULL, email TEXT NOT NULL, position INTEGER);');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS users_to_projects (id INTEGER NOT NULL PRIMARY KEY, user_id INTEGER, project_id INTEGER);');
            transaction.executeSql('CREATE TABLE IF NOT EXISTS projects (project_id INTEGER NOT NULL PRIMARY KEY, name TEXT NOT NULL, shortname TEXT NOT NULL, cat INTEGER, project_scope INTEGER);');
            //transaction.executeSql('DROP TABLE IF EXISTS project_jobcodes', [] , function (t, r) {alert("Dropped");}, function (t, e) {alert(e.message);});
            transaction.executeSql('CREATE TABLE IF NOT EXISTS project_jobcodes (id INTEGER NOT NULL PRIMARY KEY, project_id INTEGER, jobcode TEXT NOT NULL, cat TEXT, CONSTRAINT unix UNIQUE (project_id,jobcode));');
            //transaction.executeSql('DROP TABLE IF EXISTS project_materials', [] , function (t, r) {alert("Dropped");}, function (t, e) {alert(e.message);});
            //transaction.executeSql('DROP TABLE IF EXISTS project_materials', [] , function (t, r) {console.log("Dropped");}, function (t, e) {alert(e.message);});
            transaction.executeSql('CREATE TABLE IF NOT EXISTS project_materials (category TEXT, item TEXT NOT NULL, uom TEXT, cat INTEGER);', [] , function (t, r) {}, function (t, e) {alert(e.message);});
            transaction.executeSql('CREATE TABLE IF NOT EXISTS project_timesheet_workers (id INTEGER NOT NULL PRIMARY KEY, project_id INTEGER, user_id INTEGER, worker TEXT NOT NULL, jobtitle TEXT, phone TEXT, timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT unix UNIQUE (project_id,worker));', [], function (t, r) {}, function (t, e) {alert(e.message);});
            //transaction.executeSql('DROP TABLE IF EXISTS project_timesheet', [] , function (t, r) {alert("Dropped");}, function (t, e) {alert(e.message);});
            transaction.executeSql('CREATE TABLE IF NOT EXISTS project_timesheet(id INTEGER NOT NULL PRIMARY KEY, date_log DATE NOT NULL, worker TEXT NOT NULL, project TEXT NOT NULL, project_id INTEGER, jobcode TEXT NOT NULL, time_in FLOAT(5,2) NULL, time_out FLOAT(5,2) NULL, item_category TEXT, component TEXT, qty FLOAT(10,2), uom TEXT, description TEXT, hours FLOAT(5,2), lunch FLOAT(5,2), report_by INTEGER, date_submit TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, status INTEGER DEFAULT 0);', [], function (t, r) {}, function (t, e) {alert(e.message);});
            //status: 0-saved; 1-submitted; 9-uploaded
            transaction.executeSql('CREATE TABLE IF NOT EXISTS project_pictures (id INTEGER NOT NULL PRIMARY KEY, project_id INTEGER, picture_name TEXT NOT NULL, picture_description TEXT, date_uploaded TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, status INTEGER DEFAULT 0);');
        }
    );
}

$(document).ready(function() { 
        /*
      $(document).bind('deviceready', function(){
        onDeviceReady();
      })*/
    
    var sqlstr = 'SELECT email FROM users WHERE 1 ORDER BY fname';
    DEMODB.transaction(function (tx) {
        tx.executeSql(sqlstr, [], function (tx, results) {
            if(results.rows.length>0){
                var len = results.rows.length, i;
                for (i = 0; i < len; i++){
                    $('#employeelist').append('<option value="'+ results.rows.item(i).email +'">');
                }
            }
        }, function (t, e) {alert(e.message);});
    });
    
    if(Number(localStorage.userid)>0){
        window.location.replace("pageapp-calendar.html");
    }
    
    
    $('#btn-login').click(function(){
        var sqlstr = 'SELECT * FROM users WHERE email LIKE "'+$('#username').val()+'%" AND password="'+$.md5($('#password').val())+'" LIMIT 1';
        DEMODB.transaction(function (tx) {
            tx.executeSql(sqlstr, [], function (tx, results) {
                if(results.rows.length>0){
                    localStorage.username = results.rows.item(0).email;
                    localStorage.name = results.rows.item(0).fname + ' ' + results.rows.item(0).lname;;
                    localStorage.userid = results.rows.item(0).id;
                    localStorage.usertype = results.rows.item(0).position;
                    window.location.replace("pageapp-calendar.html");    
                }else{
                    //navigator.notification.alert("Incorrect username/password, please try again.");
                    window.plugins.toast.show('Incorrect username/password, please try again.', 'short', 'bottom');
                    //alert("Incorrect username/password, please try again.");
                }
            }, function (t, e) {alert(e.message);});
        });
    })
})
}(jQuery));