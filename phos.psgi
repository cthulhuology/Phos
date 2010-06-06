use Plack::Builder;
use Plack::App::File;
use Git;

use Data::Dumper;

my $app_store = sub {
	my $env = shift;
	[ 200, [ 'Content-Type' => 'text/plain' ], [ 'stored'] ];
};

my $app_revert = sub {
	my $env = shift;
	[ 200, [ 'Content-Type' => 'text/plain' ] , [ 'reverted'] ];
};

my $app_version = sub {
	my $env = shift;
	[ 200, [ 'Content-Type' => 'text/plain' ] , [ 'version'] ];
};

my $app_inventory = sub {
	opendir DIR, "object";
	my (@files) = readdir DIR;
	closedir DIR;
	[ 200, [ 'Content-Type' => 'text/plain' ], 
		[ '[ "' . join('","',  grep !/^\./, sort @files) . '" ]' ] ];
};

builder {
	mount "/objects" => $app_inventory;
	mount "/version" => $app_version;
	mount "/store" => $app_store;
	mount "/revert" => $app_revert;
	mount "/object" => Plack::App::File->new(root => "object")->to_app;
	mount "/js" => Plack::App::File->new(root => "js")->to_app;
	mount "/sounds" => Plack::App::File->new(root => "sounds")->to_app;
	mount "/images" => Plack::App::File->new(root => "images")->to_app;
	mount "/" => Plack::App::File->new(file => 'phosphor.html')->to_app;
	
};
