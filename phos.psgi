use Plack::App::File;

my $app = Plack::App::File->new(root => "./")->to_app;
