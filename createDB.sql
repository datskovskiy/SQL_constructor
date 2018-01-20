CREATE DATABASE SqlConstructorDB
GO
USE SqlConstructorDB
GO
CREATE TABLE [Users] (
	Email nvarchar(255) NOT NULL,
	PasswordHash uniqueidentifier NOT NULL,
	Delflag integer NOT NULL DEFAULT '0',
	FirstName nvarchar(255) NOT NULL,
	LastName nvarchar(255) NOt NULL,
  CONSTRAINT [PK_USERS] PRIMARY KEY CLUSTERED
  (
  [Email] ASC
  ) WITH (IGNORE_DUP_KEY = OFF)

)
GO
CREATE TABLE [Projects] (
	ProjectID integer IDENTITY(1,1) NOT NULL,
	ProjectName nvarchar(255) NOT NULL,
	ProjectOwner nvarchar(255) NOT NULL,
	ProjectDescription nvarchar(255) NULL,
	Delflag integer NOT NULL DEFAULT '0',
  CONSTRAINT [PK_PROJECTS] PRIMARY KEY CLUSTERED
  (
  [ProjectID] ASC
  ) WITH (IGNORE_DUP_KEY = OFF)

)
GO
CREATE TABLE [ConnectionDB] (
	ConnectionOwner integer NOT NULL,
	ConnectionName nvarchar(255) NOT NULL,
	ServerName nvarchar(255) NOT NULL,
	LoginDB nvarchar(255),
	PasswordDB uniqueidentifier,
	ConnectionID integer NOT NULL,
	DatabaseName nvarchar(255) NOT NULL,
	Delflag integer NOT NULL DEFAULT '0',
  CONSTRAINT [PK_CONNECTIONDB] PRIMARY KEY CLUSTERED
  (
  [ConnectionID] ASC
  ) WITH (IGNORE_DUP_KEY = OFF)

)
GO
CREATE TABLE [ProjectsShare] (
	ProjectID integer NOT NULL,
	SharedEmail nvarchar(255) NOT NULL,
	Delflag integer NOT NULL DEFAULT '0'
)
GO
CREATE TABLE [ResultHistory] (
	ResultName nvarchar(255),
	ResultOwner nvarchar(255) NOT NULL,
	ConnectionID integer NOT NULL,
	ResultBody VARCHAR(MAX) NOT NULL,
	Delflag integer NOT NULL DEFAULT '0',
	ResultDate datetime NOT NULL,
	ResultFile VARBINARY(MAX) NULL
)
GO

ALTER TABLE [Projects] WITH CHECK ADD CONSTRAINT [Projects_fk0] FOREIGN KEY ([ProjectOwner]) REFERENCES [Users]([Email])
ON UPDATE CASCADE
GO
ALTER TABLE [Projects] CHECK CONSTRAINT [Projects_fk0]
GO

ALTER TABLE [ConnectionDB] WITH CHECK ADD CONSTRAINT [ConnectionDB_fk0] FOREIGN KEY ([ConnectionOwner]) REFERENCES [Projects]([ProjectID])
ON UPDATE CASCADE
GO
ALTER TABLE [ConnectionDB] CHECK CONSTRAINT [ConnectionDB_fk0]
GO

ALTER TABLE [ProjectsShare] WITH CHECK ADD CONSTRAINT [ProjectsShare_fk0] FOREIGN KEY ([ProjectID]) REFERENCES [Projects]([ProjectID])
ON UPDATE CASCADE
GO
ALTER TABLE [ProjectsShare] CHECK CONSTRAINT [ProjectsShare_fk0]
GO

ALTER TABLE [ResultHistory] WITH CHECK ADD CONSTRAINT [ResultHistory_fk1] FOREIGN KEY ([ConnectionID]) REFERENCES [ConnectionDB]([ConnectionID])
ON UPDATE CASCADE
GO
ALTER TABLE [ResultHistory] CHECK CONSTRAINT [ResultHistory_fk1]
GO

