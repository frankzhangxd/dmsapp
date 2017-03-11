var serviceURL = "https://www.dmscorp.ca/pm/services/";
var DEMODB = openDatabase('LOCALDB', '1.0', 'Local Database', 5 * 1024 * 1024);
initDatabase();
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
            //transaction.executeSql('DROP TABLE IF EXISTS events', [] , function (t, r) {alert("Dropped");}, function (t, e) {alert(e.message);});
            transaction.executeSql('CREATE TABLE IF NOT EXISTS events (id INTEGER NOT NULL PRIMARY KEY, user TEXT NOT NULL, event_date DATE, event_description TEXT NOT NULL);');
        }
    );
}

var calendar = {
	init: function() {
        var sqlstr = "SELECT * FROM events WHERE user LIKE ? ORDER BY event_date DESC LIMIT 300";
        DEMODB.transaction(function (tx) {
            tx.executeSql(sqlstr, ['Frank Zhang'], function (tx, results) {
                if(results.rows.length>0){
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++){
                        e = results.rows.item(i).event_date.split('-');
                        day = e[2]; month =  e[1]; year = e[0];
                        user = results.rows.item(i).user;
                        if(user=='Frank Zhang')
                            user = 'Myself';
                        $('.list').append('<a href="#"  class="calendar-hour calendar-hour-taken day-event" date-day="'+ day +'" date-month="' + month +'" date-year="'+ year +'" data-number="'+ i +'"><h6><i class="fa fa-user" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;<span>'+user+'</span></h6><p>'+ results.rows.item(i).event_description +'</p></a>');
                    }
                }
            }, function (t, e) {alert(e.message);});
        }, function(err){console.log(err.code);}, function(){console.log("success!"); calendar.startCalendar();});
    },
    
  startCalendar: function() {
    var mon = 'Mo';
		var tue = 'Tu';
		var wed = 'We';
		var thur = 'Th';
		var fri = 'Fr';
		var sat = 'Sa';
		var sund = 'Su';

		/**
		 * Get current date
		 */
		var d = new Date();
		var strDate = yearNumber + "/" + (d.getMonth() + 1) + "/" + d.getDate();
		var yearNumber = (new Date).getFullYear();
		/**
		 * Get current month and set as '.current-month' in title
		 */
		var monthNumber = d.getMonth() + 1;

		function GetMonthName(monthNumber) {
			var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			return months[monthNumber - 1];
		}

		setMonth(monthNumber, mon, tue, wed, thur, fri, sat, sund);

		function setMonth(monthNumber, mon, tue, wed, thur, fri, sat, sund) {
			$('.month').text(GetMonthName(monthNumber) + ' ' + yearNumber);
			$('.month').attr('data-month', monthNumber);
			printDateNumber(monthNumber, mon, tue, wed, thur, fri, sat, sund);
		}

		$('.btn-next').on('click', function(e) {
			var monthNumber = $('.month').attr('data-month');
			if (monthNumber > 11) {
				$('.month').attr('data-month', '0');
				var monthNumber = $('.month').attr('data-month');
				yearNumber = yearNumber + 1;
				setMonth(parseInt(monthNumber) + 1, mon, tue, wed, thur, fri, sat, sund);
			} else {
				setMonth(parseInt(monthNumber) + 1, mon, tue, wed, thur, fri, sat, sund);
			};
		});

		$('.btn-prev').on('click', function(e) {
			var monthNumber = $('.month').attr('data-month');
			if (monthNumber < 2) {
				$('.month').attr('data-month', '13');
				var monthNumber = $('.month').attr('data-month');
				yearNumber = yearNumber - 1;
				setMonth(parseInt(monthNumber) - 1, mon, tue, wed, thur, fri, sat, sund);
			} else {
				setMonth(parseInt(monthNumber) - 1, mon, tue, wed, thur, fri, sat, sund);
			};
		});

		/**
		 * Get all dates for current month
		 */

		function printDateNumber(monthNumber, mon, tue, wed, thur, fri, sat, sund) {
            
			$($('div.calendar-days div.row')).each(function(index) {
				$(this).empty();
			});

			$($('div.calendar-titles div.row')).each(function(index) {
				$(this).empty();
			});

			function getDaysInMonth(month, year) {
				// Since no month has fewer than 28 days
				var date = new Date(year, month, 1);
				var days = [];
				while (date.getMonth() === month) {
					days.push(new Date(date));
					date.setDate(date.getDate() + 1);
				}
				return days;
			}

			i = 0;

			setDaysInOrder(mon, tue, wed, thur, fri, sat, sund);

			function setDaysInOrder(mon, tue, wed, thur, fri, sat, sund) {
                $('div.calendar-titles div.row').append('<a href="#" class="light-titles">' + sund + '</a><a href="#">' + mon + '</a><a href="#">' + tue + '</a><a href="#">' + wed + '</a><a href="#">' + thur + '</a><a href="#">' + fri + '</a><a href="#" class="light-titles">' + sat + '</a>');
			};

            var d = new Date(yearNumber, monthNumber -1, 1);
            var firstday = d.getDay();
            var e = new Date(d.setDate(d.getDate() - firstday));
            for(i=0; i<firstday; i++){
                $('div.calendar-days div.1').append('<a href="#" class="extra-light-day"  date-month="' + (e.getMonth() + 1) + '" date-day="' + (parseInt(e.getDate()) + i) + '" date-year="' + e.getFullYear() + '"><i class="fa fa-circle"></i>' + (parseInt(e.getDate())+ i) + '</a>');
            }
            
            var col = firstday + 1;
            var row = 1;
			$(getDaysInMonth(monthNumber - 1, yearNumber)).each(function(index) {
				var index = index + 1;
                var dayclass = 'clear-day';
                if(col>7){
                    row++;
                    col = 1; 
                }
                if(col==1 || col==7){dayclass = 'light-day';}
                $('div.calendar-days div.'+row).append('<a href="#" class="' + dayclass + '" date-month="' + monthNumber + '" date-day="' + index + '" date-year="' + yearNumber + '"><i class="fa fa-circle"></i>' + index + '</a>');
                col++;
			});
            var nd = new Date(yearNumber, monthNumber, 1);
            var e = new Date(nd.setDate(nd.getDate()));
            console.log(e);
            var index = 1;
            while(col<8){ 
                $('div.calendar-days div.'+row).append('<a href="#" class="extra-light-day"  date-month="' + (e.getMonth() + 1) + '" date-day="' + index + '" date-year="' + e.getFullYear() + '"><i class="fa fa-circle"></i>' + index + '</a>');
                col++; index++;
            }
			var date = new Date();
			var month = date.getMonth() + 1;
			var thisyear = new Date().getFullYear();
			setCurrentDay(month, thisyear);
			setEvent();
			displayEvent();
		}

		/**
		 * Get current day and set as '.current-day'
		 */
		function setCurrentDay(month, year) {
			var viewMonth = $('.month').attr('data-month');
			var eventYear = $('.event-days').attr('date-year');
            
			if (parseInt(year) === yearNumber) {
				if (parseInt(month) === parseInt(viewMonth)) {
					$('div.calendar-days a[date-day="' + d.getDate() + '"]').addClass('current-day');
                    $('.no-event').slideUp('fast');
                    if($('.day-event[date-month="' + month + '"][date-day="' + d.getDate() + '"]').size()>0)
    				    $('.day-event[date-month="' + month + '"][date-day="' + d.getDate() + '"]').slideDown('fast');
                    else
                        $('.no-event').slideDown('fast');
    				}
			}
		};

		/**
		 * Add class '.active' on calendar date
		 */
		$('div.calendar-days a').on('click', function(e) {
			if ($(this).hasClass('event')) {
				$('div.calendar-days a').removeClass('active');
				$(this).addClass('active');
			} else {
				$('div.calendar-days a').removeClass('active');
			};
		});

		/**
		 * Add '.event' class to all days that has an event
		 */
		function setEvent() {
			$('.day-event').each(function(i) {
				var eventMonth = $(this).attr('date-month');
				var eventDay = $(this).attr('date-day');
				var eventYear = $(this).attr('date-year');
				var eventClass = $(this).attr('event-class');
				if (eventClass === undefined) eventClass = 'event';
				else eventClass = 'event ' + eventClass;
                console.log(eventMonth+'-'+eventDay);
				if (parseInt(eventYear) === yearNumber) {
					$('div.calendar-days a[date-month="' + eventMonth + '"][date-day="' + eventDay + '"]').addClass(eventClass);
				}
			});
		};

		/**
		 * Get current day on click in calendar
		 * and find day-event to display
		 */
		function displayEvent() {
			$('div.calendar-days a').on('click', function(e) {
				$('.day-event').slideUp('fast');
                $('.no-event').slideUp('fast');
                $('.selected').removeClass('selected');
                $(this).addClass('selected');
				var monthEvent = $(this).attr('date-month');
				var dayEvent = $(this).text();
                var yearEvent = $(this).attr('date-year');
                if($('.day-event[date-month="' + monthEvent + '"][date-day="' + dayEvent + '"]').size()>0)
				    $('.day-event[date-month="' + monthEvent + '"][date-day="' + dayEvent + '"]').slideDown('fast');
                else
                    $('.no-event').slideDown('fast');
                $('#date_selected').val(yearEvent+'-'+monthEvent+'-'+dayEvent);
			});
		};

		/**
		 * Close day-event
		 */
		$('.close').on('click', function(e) {
			$(this).parent().slideUp('fast');
		});
  },

};

$(document).ready(function() {
	calendar.init();
    $('div.new-event-wrapper').hide();
    $('a.new-event').click(function(e){
        e.preventDefault();
        $('div.new-event-wrapper').show();
        $(this).hide();
    })
    $('div.new-event-wrapper a.btn-cancel').click(function(e){
        e.preventDefault();
        $('div.new-event-wrapper').hide();
        $('a.new-event').show();
    })
    $('div.new-event-wrapper a.btn-save').click(function(e){
        e.preventDefault();
        $desc = $('#event_description').val();
        if($desc==''){
            alert('Please setup time and description.');
        }else{
            //save to local database
            sql = "INSERT INTO events(user, event_date, event_description) VALUES (?, ?,?)";
            DEMODB.transaction(
                function (transaction) {
                    transaction.executeSql(sql, ['Frank Zhang', $('#date_selected').val(), $desc] , function (t, r) {
                        console.log('saved');
                        //window.plugins.toast.show('Saved', 'short', 'center'); 
                    }, function (t, e) {alert(e.message);});
                }
            );
            console.log(sql);
            $('#event_description').val('');
            $('.no-event').slideUp('fast');
            e = $('#date_selected').val().split('-');
            day = e[2]; month =  e[1]; year = e[0];
            $('.list').append('<div class="day-event" date-day="'+ day +'" date-month="' + month +'" date-year="'+ year +'" data-number="'+ i +'"><a href="#" class="close fontawesome-remove"></a><p>'+ $desc +'</p></div>');
            $('.day-event[date-month="' + month + '"][date-day="' + day + '"]').slideDown('fast');        
            $('div.new-event-wrapper').hide();
            $('a.new-event').show();
            $('tbody.event-calendar tr td.selected').addClass('event');
            
        }
    })
});
