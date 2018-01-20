namespace QueryBuilderMVC.Models
{
    public class ConnectionsListViewModel
    {
        public int ConnectionID { get; set; }

        public int ConnectionOwner { get; set; }

        public string ConnectionName { get; set; }

        public string ServerName { get; set; }

        public string LoginDB { get; set; }

        public string DatabaseName { get; set; }

        public byte[] PasswordDB { get; set; }
    }
}