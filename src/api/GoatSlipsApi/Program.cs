using GoatSlipsApi.DAL;
using GoatSlipsApi.Models;
using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

string appsettingsFileName = Debugger.IsAttached ? "appsettings.Development.json" : "appsettings.json";

var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile(appsettingsFileName);

IConfigurationRoot config = configuration.Build();
string connectionString = config.GetConnectionString("ConnectionString");

// Add services to the container.
builder.Services.AddSingleton<IAppSettings>(new AppSettings(connectionString));
builder.Services.AddScoped<IGoatSlipsContext, GoatSlipsContext>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    appsettingsFileName = "appsettings.Development.json";
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
