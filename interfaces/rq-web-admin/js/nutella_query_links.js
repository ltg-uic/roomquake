var n_run_id = "roomquake";
var n_broker = "ltg.evl.uic.edu";

$('a').each(function (index) {
	var link = $(this).attr('href');
	if (link!="")
		$(this).attr('href', link + "?run_id=" + n_run_id + "&broker=" + n_broker);
});