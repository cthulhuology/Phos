use Plack::Builder;
use Plack::App::File;

use Data::Dumper;

sub readfile {
	print STDERR "reading $_[0]\n";
	open FP, "< $_[0]";
	undef $/;
	my $text = <FP>;
	close FP;
	print STDERR "got $text";
	$text;
}

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

my $phos_js = sub {
	my @files = ('Object','Number','Array','String','Box','Widget','Component','Event','Device','Resource',
               'Palette','Font','Display','Keyboard','Mouse','Screen','Text','Sound','Image','Movie',
               'Key','Page',
               'Help','Inventory','Trash','Objects','Mirror','Desktop',
               'Names','HotKey','Block',
               'Graphic','Rectangle','Circle','Daimond',
               'Blog','Search','App'); 
	[ 200, [ 'Content-Type' => 'application/javascript' ],
		[ map { readfile("object/$_") } @files ]];
};

builder {
	mount "/objects" => $app_inventory;
	mount "/version" => $app_version;
	mount "/store" => $app_store;
	mount "/revert" => $app_revert;
	mount "/object" => Plack::App::File->new(root => "object")->to_app;
	mount "/js" => $phos_js;
	mount "/sounds" => Plack::App::File->new(root => "sounds")->to_app;
	mount "/images" => Plack::App::File->new(root => "images")->to_app;
	mount "/" => Plack::App::File->new(file => 'index.html')->to_app;
};
