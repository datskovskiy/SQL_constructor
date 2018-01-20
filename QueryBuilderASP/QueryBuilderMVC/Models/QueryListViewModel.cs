using System;


namespace QueryBuilderMVC.Models
{
	public class QueryListViewModel
	{
		public int QueryID { get; set; }
        public string Description { get; set; }

        public string QueryName { get; set; }

		public int UserID { get; set; }

		public int ProjectID { get; set; }

		public string QueryBody { get; set; }

		public DateTime QueryDate { get; set; }


	}
}
