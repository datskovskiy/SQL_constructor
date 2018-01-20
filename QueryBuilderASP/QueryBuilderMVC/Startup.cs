using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(QueryBuilderMVC.Startup))]
namespace QueryBuilderMVC
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
