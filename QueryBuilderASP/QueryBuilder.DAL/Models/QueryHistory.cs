using System;

namespace QueryBuilder.DAL.Models
{
	public class QueryHistory
	{
#pragma warning disable 0436

		public int QueryHistoryID { get; set; }

		public int UserID { get; set; }

		public int ProjectID { get; set; }

		public DateTime QueryDate { get; set; }

		public string QueryBody { get; set; }

		public int Delflag { get; set; }

		public virtual Project Project { get; set; }


	}
}
