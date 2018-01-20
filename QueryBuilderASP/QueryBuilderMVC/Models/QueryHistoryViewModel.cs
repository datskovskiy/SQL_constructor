using System;
using System.Collections.Generic;

namespace QueryBuilderMVC.Models
{
	public class QueryHistoryViewModel
	{
        public IEnumerable<QueryHistoryListViewModel> QueryHistory { get; set; }
		public int QueryHistoryID { get; set; }

		public int UserID { get; set; }

		public int ProjectID { get; set; }

		public string QueryBody { get; set; }

		public DateTime QueryDate { get; set; }




	}


}