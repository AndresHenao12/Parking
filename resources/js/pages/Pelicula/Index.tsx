import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowDownRight,
    Bell,
    Building2,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Film,
    Heart,
    Info,
    Menu,
    Map,
    MapPin,
    Pencil,
    Plus,
    Search,
    Sparkles,
    Star,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import '../../../css/pelicula.css';

interface Pelicula {
    id: number;
    titulo: string;
    director: string | null;
    anio: number | null;
    duracion_minutos: number;
    clasificacion: string;
    estado: boolean;
    genero: string;
    sinopsis: string;
    imagen: string | null;
}

interface Props {
    peliculas: Pelicula[];
    ubicaciones: Departamento[];
}

interface Departamento {
    id: number;
    nombre: string;
    ciudades: Ciudad[];
}

interface Ciudad {
    id: number;
    departamento_id: number;
    nombre: string;
    sucursales: Sucursal[];
}

interface Sucursal {
    id: number;
    ciudad_id: number;
    nombre: string;
    direccion: string;
    descripcion: string | null;
}

interface Movie {
    id: number;
    title: string;
    director: string;
    year: number | null;
    duration: number;
    rating: string;
    genre: string;
    synopsis: string;
    image: string;
    imagePath?: string | null;
    score: string;
    note: string;
}

const artwork = {
    city: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=85',
    night: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1000&q=85',
    ocean: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=85',
    mountain:
        'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85',
    forest: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=85',
    stars: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1000&q=85',
    desert: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=85',
    road: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85',
    fog: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1000&q=85',
    lake: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1000&q=85',
    cabin: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1000&q=85',
    coast: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1000&q=85',
    architecture:
        'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1000&q=85',
    rain: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85',
};

const editorialMovies: Movie[] = [
    {
        id: -1,
        title: 'Chrono Noir: El vórtice',
        director: 'Lena Moreau',
        year: 2024,
        duration: 128,
        rating: '16+',
        genre: 'Ciencia ficción',
        synopsis:
            'En una metrópolis donde existen simultáneamente dos líneas temporales colapsadas, una archivista cuántica debe reconstruir un crimen que aún no se ha cometido para evitar la disolución total de la memoria colectiva.',
        image: artwork.city,
        score: '9.4',
        note: 'Original Nocturne',
    },
    {
        id: -2,
        title: 'Aurora de cristal',
        director: 'Ivo Laurent',
        year: 2023,
        duration: 114,
        rating: '13+',
        genre: 'Fantasía',
        synopsis:
            'Una cartógrafa sigue una aurora imposible hasta una costa olvidada, donde cada luz revela un recuerdo que el mundo había perdido.',
        image: artwork.ocean,
        score: '9.1',
        note: 'Fantasía contemplativa',
    },
    {
        id: -3,
        title: 'La sala silenciosa',
        director: 'Mara Solís',
        year: 2024,
        duration: 102,
        rating: '16+',
        genre: 'Misterio',
        synopsis:
            'En un hotel que no figura en ningún mapa, una pianista encuentra cartas escritas por huéspedes que todavía no han llegado.',
        image: artwork.architecture,
        score: '8.8',
        note: 'Drama psicológico',
    },
    {
        id: -4,
        title: 'Nocturno en la costa',
        director: 'Tomás Bell',
        year: 2023,
        duration: 96,
        rating: '13+',
        genre: 'Suspenso',
        synopsis:
            'Una carretera junto al mar y una llamada que se repite cada noche conducen a una pequeña comunidad hacia una verdad enterrada.',
        image: artwork.coast,
        score: '8.7',
        note: 'Thriller atmosférico',
    },
    {
        id: -5,
        title: 'Dualidad sombra',
        director: 'Aya Nakamura',
        year: 2024,
        duration: 119,
        rating: '16+',
        genre: 'Ciencia ficción',
        synopsis:
            'Dos desconocidas comienzan a compartir los mismos sueños y descubren que sus ciudades existen a ambos lados de un espejo.',
        image: artwork.night,
        score: '9.2',
        note: 'Misterio futurista',
    },
    {
        id: -6,
        title: 'Cénit cero',
        director: 'Nicolás Vega',
        year: 2023,
        duration: 108,
        rating: '13+',
        genre: 'Drama',
        synopsis:
            'Durante una noche interminable, un farero recibe mensajes de una estación que desapareció bajo el horizonte hace cien años.',
        image: artwork.fog,
        score: '9.0',
        note: 'Drama de autor',
    },
    {
        id: -7,
        title: 'Jardín de vidrio',
        director: 'Camila Ríos',
        year: 2024,
        duration: 111,
        rating: 'ATP',
        genre: 'Fantasía',
        synopsis:
            'Una joven jardinera hereda un invernadero donde las plantas florecen con las historias de quienes las cuidan.',
        image: artwork.forest,
        score: '8.9',
        note: 'Selección boutique',
    },
    {
        id: -8,
        title: 'Llamada de la niebla',
        director: 'Elián Cruz',
        year: 2023,
        duration: 98,
        rating: '16+',
        genre: 'Misterio',
        synopsis:
            'Una radioaficionada escucha una voz conocida en una frecuencia que solo aparece cuando la montaña queda cubierta de niebla.',
        image: artwork.lake,
        score: '8.6',
        note: 'Misterio íntimo',
    },
    {
        id: -9,
        title: 'Las dos lunas',
        director: 'Sora Kim',
        year: 2024,
        duration: 123,
        rating: '13+',
        genre: 'Ciencia ficción',
        synopsis:
            'En una colonia al borde del océano, una astrónoma tiene una última noche para descifrar el mensaje de una segunda luna.',
        image: artwork.stars,
        score: '9.3',
        note: 'Serie exclusiva · T1',
    },
    {
        id: -10,
        title: 'El laberinto de papel',
        director: 'Rafael Ibáñez',
        year: 2024,
        duration: 106,
        rating: '13+',
        genre: 'Aventura',
        synopsis:
            'Un encuadernador y su nieta recorren una ciudad cuyos callejones se reescriben al pasar cada página.',
        image: artwork.cabin,
        score: '8.7',
        note: 'Aventura poética',
    },
    {
        id: -11,
        title: 'La casa de la marea',
        director: 'Inés Vidal',
        year: 2022,
        duration: 116,
        rating: '13+',
        genre: 'Drama',
        synopsis:
            'Tres hermanas vuelven a la casa familiar antes de que el océano reclame la última calle de su pueblo.',
        image: artwork.coast,
        score: '8.8',
        note: 'Drama familiar',
    },
    {
        id: -12,
        title: 'Kilómetro de luz',
        director: 'Jules Morel',
        year: 2024,
        duration: 101,
        rating: 'ATP',
        genre: 'Aventura',
        synopsis:
            'Un fotógrafo cruza el desierto buscando el lugar exacto donde su madre capturó la última puesta de sol del siglo.',
        image: artwork.road,
        score: '8.5',
        note: 'Viaje cinematográfico',
    },
    {
        id: -13,
        title: 'El faro de cristal',
        director: 'Lucía Ferrer',
        year: 2023,
        duration: 132,
        rating: '16+',
        genre: 'Drama',
        synopsis:
            'Una restauradora llega a una isla para reconstruir un faro y descubre las historias que sus destellos mantuvieron a salvo.',
        image: artwork.mountain,
        score: '9.1',
        note: 'León de Oro · Venecia',
    },
    {
        id: -14,
        title: 'Cadencia silente',
        director: 'Sanae Ito',
        year: 2024,
        duration: 104,
        rating: '13+',
        genre: 'Drama',
        synopsis:
            'La última sala de un cine de barrio reúne cada semana a quienes todavía necesitan compartir una historia.',
        image: artwork.night,
        score: '9.5',
        note: 'Premio especial del jurado',
    },
    {
        id: -15,
        title: 'Tiempo escondido',
        director: 'André Costa',
        year: 2023,
        duration: 117,
        rating: 'ATP',
        genre: 'Aventura',
        synopsis:
            'Un relojero encuentra una hora secreta entre el día y la noche, y decide devolverle a su ciudad los instantes perdidos.',
        image: artwork.desert,
        score: '8.8',
        note: 'Clásico restaurado',
    },
];

function getStoredFavorites(): number[] {
    const stored = window.localStorage.getItem('nocturne-favorites');
    if (!stored) return [];

    try {
        const value: unknown = JSON.parse(stored);
        if (
            Array.isArray(value) &&
            value.every((id) => typeof id === 'number')
        ) {
            return value;
        }
        throw new Error(
            'El formato guardado no es una lista de identificadores.',
        );
    } catch (error) {
        console.error('No se pudieron cargar los favoritos guardados.', error);
        return [];
    }
}

function saveFavorites(favorites: number[]) {
    try {
        window.localStorage.setItem(
            'nocturne-favorites',
            JSON.stringify(favorites),
        );
    } catch (error) {
        console.error('No se pudieron guardar los favoritos.', error);
    }
}

function toMovie(pelicula: Pelicula, index: number): Movie {
    const fallback = editorialMovies[index % editorialMovies.length];

    return {
        id: pelicula.id,
        title: pelicula.titulo,
        director: pelicula.director ?? 'Dirección no especificada',
        year: pelicula.anio,
        duration: pelicula.duracion_minutos,
        rating: pelicula.clasificacion,
        genre: pelicula.genero,
        synopsis: pelicula.sinopsis,
        image: pelicula.imagen
            ? pelicula.imagen.startsWith('http')
                ? pelicula.imagen
                : `/storage/${pelicula.imagen.replace(/^\/+/, '')}`
            : fallback.image,
        imagePath: pelicula.imagen,
        score: '—',
        note: 'En el catálogo',
    };
}

function MovieCard({
    movie,
    favorite,
    onFavorite,
    onDetails,
    onEdit,
    onDelete,
    compact = false,
}: {
    movie: Movie;
    favorite: boolean;
    onFavorite: (id: number) => void;
    onDetails: (movie: Movie) => void;
    onEdit: (movie: Movie) => void;
    onDelete: (movie: Movie) => void;
    compact?: boolean;
}) {
    return (
        <article
            className={`movie-card${compact ? ' movie-card--compact' : ''}`}
        >
            <button
                type="button"
                className="movie-card__poster"
                onClick={() => onDetails(movie)}
                aria-label={`Ver detalles de ${movie.title}`}
            >
                <img src={movie.image} alt="" loading="lazy" />
                <span className="movie-card__shade" />
                {movie.score !== '—' && (
                    <span className="movie-card__rating">
                        <Star size={11} fill="currentColor" />
                        {movie.score}
                    </span>
                )}
                <span className="movie-card__poster-title">{movie.title}</span>
                <span className="movie-card__open">
                    <Info size={15} />
                    Detalles
                </span>
            </button>
            <button
                type="button"
                className={`movie-card__favorite${favorite ? ' is-active' : ''}`}
                onClick={() => onFavorite(movie.id)}
                aria-label={
                    favorite
                        ? `Quitar ${movie.title} de Mi lista`
                        : `Añadir ${movie.title} a Mi lista`
                }
                aria-pressed={favorite}
            >
                <Heart size={14} fill={favorite ? 'currentColor' : 'none'} />
            </button>
            {movie.id > 0 && (
                <>
                    <button
                        type="button"
                        className="movie-card__edit"
                        onClick={() => onEdit(movie)}
                        aria-label={`Editar ${movie.title}`}
                    >
                        <Pencil size={13} />
                    </button>
                    <button
                        type="button"
                        className="movie-card__delete"
                        onClick={() => onDelete(movie)}
                        aria-label={`Eliminar ${movie.title}`}
                    >
                        <Trash2 size={13} />
                    </button>
                </>
            )}
            <div className="movie-card__meta">
                <span>
                    {movie.year ?? '—'} <span aria-hidden="true">·</span>{' '}
                    {movie.genre}
                </span>
                {!compact && <span>{movie.note}</span>}
            </div>
        </article>
    );
}

function SectionHeading({
    title,
    subtitle,
    onPrevious,
    onNext,
}: {
    title: string;
    subtitle?: string;
    onPrevious?: () => void;
    onNext?: () => void;
}) {
    return (
        <div className="section-heading">
            <div>
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
            </div>
            {onPrevious && onNext && (
                <div className="carousel-controls">
                    <button
                        type="button"
                        onClick={onPrevious}
                        aria-label={`Desplazar ${title} a la izquierda`}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={onNext}
                        aria-label={`Desplazar ${title} a la derecha`}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

function MovieDetails({
    movie,
    favorite,
    onClose,
    onFavorite,
}: {
    movie: Movie;
    favorite: boolean;
    onClose: () => void;
    onFavorite: (id: number) => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    return (
        <dialog
            ref={dialogRef}
            className="movie-dialog"
            aria-labelledby="movie-dialog-title"
            onClose={onClose}
            onClick={(event) => {
                if (event.target === dialogRef.current) onClose();
            }}
        >
            <div className="movie-dialog__content">
                <button
                    type="button"
                    className="movie-dialog__close"
                    onClick={() => dialogRef.current?.close()}
                    aria-label="Cerrar detalles"
                >
                    <X size={19} />
                </button>
                <img className="movie-dialog__image" src={movie.image} alt="" />
                <div className="movie-dialog__body">
                    <span className="eyebrow">
                        <Sparkles size={12} /> Ficha de película
                    </span>
                    <h2 id="movie-dialog-title">{movie.title}</h2>
                    <div className="movie-dialog__facts">
                        <span>
                            <Star size={13} fill="currentColor" /> {movie.score}
                        </span>
                        <span>{movie.year ?? '—'}</span>
                        <span>
                            <Clock3 size={13} /> {movie.duration} min
                        </span>
                        <span>{movie.rating}</span>
                    </div>
                    <p>{movie.synopsis}</p>
                    <p className="movie-dialog__director">
                        Dirección: <strong>{movie.director}</strong>
                    </p>
                    <div className="movie-dialog__actions">
                        <button
                            type="button"
                            className="button button--secondary"
                            onClick={() => onFavorite(movie.id)}
                        >
                            {favorite ? (
                                <Check size={15} />
                            ) : (
                                <Plus size={15} />
                            )}
                            {favorite ? 'En Mi lista' : 'Añadir a Mi lista'}
                        </button>
                        <span className="movie-dialog__notice">
                            <Info size={14} /> Información de la película;
                            tráiler no disponible.
                        </span>
                    </div>
                </div>
            </div>
        </dialog>
    );
}

interface MovieFormData {
    titulo: string;
    director: string;
    anio: string;
    duracion_minutos: string;
    clasificacion: string;
    genero: string;
    sinopsis: string;
    imagen: string;
}

const emptyMovieForm: MovieFormData = {
    titulo: '',
    director: '',
    anio: '',
    duracion_minutos: '',
    clasificacion: 'ATP',
    genero: 'Drama',
    sinopsis: '',
    imagen: '',
};

function MovieFormDialog({
    movie,
    onClose,
}: {
    movie: Movie | null;
    onClose: () => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const form = useForm<MovieFormData>(
        movie
            ? {
                  titulo: movie.title,
                  director:
                      movie.director === 'Dirección no especificada'
                          ? ''
                          : movie.director,
                  anio: movie.year?.toString() ?? '',
                  duracion_minutos: movie.duration.toString(),
                  clasificacion: movie.rating,
                  genero: movie.genre,
                  sinopsis: movie.synopsis,
                  imagen: movie.imagePath ?? '',
              }
            : emptyMovieForm,
    );

    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    const closeDialog = () => {
        dialogRef.current?.close();
        onClose();
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = { onSuccess: closeDialog };

        if (movie) {
            form.put(`/peliculas/${movie.id}`, options);
        } else {
            form.post('/peliculas', options);
        }
    };

    return (
        <dialog
            ref={dialogRef}
            className="movie-dialog movie-form-dialog"
            aria-labelledby="movie-form-title"
            onClose={onClose}
            onClick={(event) => {
                if (event.target === dialogRef.current) closeDialog();
            }}
        >
            <div className="movie-dialog__content movie-form-dialog__content">
                <button
                    type="button"
                    className="movie-dialog__close"
                    onClick={closeDialog}
                    aria-label="Cerrar formulario"
                >
                    <X size={19} />
                </button>
                <form className="movie-form" onSubmit={handleSubmit}>
                    <span className="eyebrow">
                        <Film size={12} /> Catálogo de películas
                    </span>
                    <h2 id="movie-form-title">
                        {movie ? 'Editar película' : 'Nueva película'}
                    </h2>
                    <div className="movie-form__grid">
                        <label className="movie-form__field movie-form__field--wide">
                            Título
                            <input
                                required
                                maxLength={150}
                                value={form.data.titulo}
                                onChange={(event) =>
                                    form.setData('titulo', event.target.value)
                                }
                            />
                            {form.errors.titulo && (
                                <span className="movie-form__error">
                                    {form.errors.titulo}
                                </span>
                            )}
                        </label>
                        <label className="movie-form__field">
                            Dirección
                            <input
                                maxLength={120}
                                value={form.data.director}
                                onChange={(event) =>
                                    form.setData('director', event.target.value)
                                }
                            />
                            {form.errors.director && (
                                <span className="movie-form__error">
                                    {form.errors.director}
                                </span>
                            )}
                        </label>
                        <label className="movie-form__field">
                            Año
                            <input
                                type="number"
                                min={1888}
                                max={2100}
                                value={form.data.anio}
                                onChange={(event) =>
                                    form.setData('anio', event.target.value)
                                }
                            />
                            {form.errors.anio && (
                                <span className="movie-form__error">
                                    {form.errors.anio}
                                </span>
                            )}
                        </label>
                        <label className="movie-form__field">
                            Duración (minutos)
                            <input
                                required
                                type="number"
                                min={1}
                                max={65535}
                                value={form.data.duracion_minutos}
                                onChange={(event) =>
                                    form.setData(
                                        'duracion_minutos',
                                        event.target.value,
                                    )
                                }
                            />
                            {form.errors.duracion_minutos && (
                                <span className="movie-form__error">
                                    {form.errors.duracion_minutos}
                                </span>
                            )}
                        </label>
                        <label className="movie-form__field">
                            Género
                            <select
                                value={form.data.genero}
                                onChange={(event) =>
                                    form.setData('genero', event.target.value)
                                }
                            >
                                {[
                                    'Acción',
                                    'Aventura',
                                    'Ciencia ficción',
                                    'Comedia',
                                    'Drama',
                                    'Fantasía',
                                    'Terror',
                                    'Suspenso',
                                ].map((item) => (
                                    <option key={item}>{item}</option>
                                ))}
                            </select>
                            {form.errors.genero && (
                                <span className="movie-form__error">
                                    {form.errors.genero}
                                </span>
                            )}
                        </label>
                        <label className="movie-form__field">
                            Clasificación
                            <select
                                value={form.data.clasificacion}
                                onChange={(event) =>
                                    form.setData(
                                        'clasificacion',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="ATP">ATP</option>
                                <option value="13">Mayores de 13</option>
                                <option value="16">Mayores de 16</option>
                                <option value="18">Mayores de 18</option>
                            </select>
                            {form.errors.clasificacion && (
                                <span className="movie-form__error">
                                    {form.errors.clasificacion}
                                </span>
                            )}
                        </label>
                        <label className="movie-form__field movie-form__field--wide">
                            URL o ruta de la imagen
                            <input
                                maxLength={255}
                                value={form.data.imagen}
                                onChange={(event) =>
                                    form.setData('imagen', event.target.value)
                                }
                                placeholder="https://..."
                            />
                            {form.errors.imagen && (
                                <span className="movie-form__error">
                                    {form.errors.imagen}
                                </span>
                            )}
                        </label>
                        <label className="movie-form__field movie-form__field--wide">
                            Sinopsis
                            <textarea
                                required
                                rows={4}
                                value={form.data.sinopsis}
                                onChange={(event) =>
                                    form.setData('sinopsis', event.target.value)
                                }
                            />
                            {form.errors.sinopsis && (
                                <span className="movie-form__error">
                                    {form.errors.sinopsis}
                                </span>
                            )}
                        </label>
                    </div>
                    <div className="movie-form__actions">
                        <button
                            type="button"
                            className="button button--secondary"
                            onClick={closeDialog}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="button button--primary"
                            disabled={form.processing}
                        >
                            <Check size={14} />
                            {form.processing
                                ? 'Guardando...'
                                : movie
                                  ? 'Guardar cambios'
                                  : 'Crear película'}
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}

export default function PeliculaIndex({ peliculas, ubicaciones }: Props) {
    const catalog = useMemo(
        () => [...editorialMovies, ...peliculas.map(toMovie)],
        [peliculas],
    );
    const [favorites, setFavorites] = useState<number[]>([]);
    const [search, setSearch] = useState('');
    const [genre, setGenre] = useState('Todos los géneros');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedCity, setSelectedCity] = useState('all');
    const [showFavorites, setShowFavorites] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [movieFormOpen, setMovieFormOpen] = useState(false);
    const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const trendingRef = useRef<HTMLDivElement>(null);
    const recommendationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setFavorites(getStoredFavorites());
    }, []);

    const genres = useMemo(
        () => [...new Set(catalog.map((movie) => movie.genre))].sort(),
        [catalog],
    );
    const matchingMovies = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();
        return catalog.filter((movie) => {
            const matchesSearch =
                !query ||
                `${movie.title} ${movie.director} ${movie.genre}`
                    .toLocaleLowerCase()
                    .includes(query);
            const matchesGenre =
                genre === 'Todos los géneros' || movie.genre === genre;
            const matchesFavorite =
                !showFavorites || favorites.includes(movie.id);
            return matchesSearch && matchesGenre && matchesFavorite;
        });
    }, [catalog, favorites, genre, search, showFavorites]);
    const availableCities = useMemo(
        () =>
            ubicaciones
                .filter(
                    (department) =>
                        selectedDepartment === 'all' ||
                        String(department.id) === selectedDepartment,
                )
                .flatMap((department) => department.ciudades),
        [selectedDepartment, ubicaciones],
    );
    const visibleLocations = useMemo(
        () =>
            ubicaciones
                .filter(
                    (department) =>
                        selectedDepartment === 'all' ||
                        String(department.id) === selectedDepartment,
                )
                .map((department) => ({
                    ...department,
                    ciudades: department.ciudades
                        .filter(
                            (city) =>
                                selectedCity === 'all' ||
                                String(city.id) === selectedCity,
                        )
                        .filter((city) => city.sucursales.length > 0),
                }))
                .filter((department) => department.ciudades.length > 0),
        [selectedCity, selectedDepartment, ubicaciones],
    );

    const toggleFavorite = (id: number) => {
        setFavorites((current) => {
            const next = current.includes(id)
                ? current.filter((favoriteId) => favoriteId !== id)
                : [...current, id];
            saveFavorites(next);
            return next;
        });
    };

    const scrollCarousel = (
        ref: React.RefObject<HTMLDivElement | null>,
        direction: number,
    ) => {
        ref.current?.scrollBy({
            left: direction * ref.current.clientWidth * 0.8,
            behavior: 'smooth',
        });
    };

    const hero = editorialMovies[0];
    const trending = matchingMovies.slice(0, 6);
    const atmosphere = matchingMovies.slice(3, 6);
    const recommendations = matchingMovies.slice(6, 12);
    const collections = [
        {
            title: 'Visión monumental',
            detail: '8 títulos · 4K HDR · Documental exclusivo incluido',
            tag: 'Retrospectiva completa',
            image: artwork.mountain,
        },
        {
            title: 'Poéticas nocturnas',
            detail: '6 títulos · Masterizados en 35mm · Versiones inéditas',
            tag: 'Ciclo de melancolía urbana',
            image: artwork.night,
        },
        {
            title: 'Tiempo esculpido',
            detail: '5 obras maestras · Restauración fílmica en 4K',
            tag: 'Clásicos restaurados',
            image: artwork.fog,
        },
    ];

    const showMovieDetails = (movie: Movie) => setSelectedMovie(movie);
    const createMovie = () => {
        setEditingMovie(null);
        setMovieFormOpen(true);
    };
    const editMovie = (movie: Movie) => {
        setEditingMovie(movie);
        setMovieFormOpen(true);
    };
    const deleteMovie = (movie: Movie) => {
        if (
            !window.confirm(
                `¿Eliminar "${movie.title}" del catálogo? Esta acción no se puede deshacer.`,
            )
        ) {
            return;
        }

        router.delete(`/peliculas/${movie.id}`, {
            onSuccess: () => {
                setFavorites((current) => {
                    const next = current.filter((id) => id !== movie.id);
                    saveFavorites(next);
                    return next;
                });
            },
        });
    };

    return (
        <>
            <Head title="Nocturne · Cine de autor" />
            <div className="nocturne">
                <header className="site-header">
                    <div className="site-header__inner">
                        <a
                            href="#inicio"
                            className="brand"
                            aria-label="Nocturne, inicio"
                            onClick={() => setShowFavorites(false)}
                        >
                            <span className="brand__mark">
                                <span />
                            </span>
                            <span className="brand__small">NOCTURNE</span>
                            <span className="brand__name">Nocturne</span>
                        </a>

                        <button
                            type="button"
                            className="mobile-menu-button"
                            aria-label={
                                mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'
                            }
                            aria-expanded={mobileMenuOpen}
                            onClick={() => setMobileMenuOpen((open) => !open)}
                        >
                            {mobileMenuOpen ? (
                                <X size={18} />
                            ) : (
                                <Menu size={18} />
                            )}
                        </button>

                        <nav
                            className={`main-nav${mobileMenuOpen ? ' is-open' : ''}`}
                            aria-label="Navegación principal"
                        >
                            <a
                                className="main-nav__active"
                                href="#inicio"
                                onClick={() => setShowFavorites(false)}
                            >
                                Inicio
                            </a>
                            <a
                                href="#tendencias"
                                onClick={() => setShowFavorites(false)}
                            >
                                Películas
                            </a>
                            <a
                                href="#colecciones"
                                onClick={() => setShowFavorites(false)}
                            >
                                Colecciones
                            </a>
                            <a
                                href="/trabajadores"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Trabajadores
                            </a>
                            <button
                                type="button"
                                className={showFavorites ? 'is-selected' : ''}
                                onClick={() => {
                                    setShowFavorites((value) => !value);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                Mi lista
                            </button>
                        </nav>

                        <label className="search-box">
                            <Search size={15} aria-hidden="true" />
                            <span className="sr-only">Buscar películas</span>
                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Títulos, personas, géneros..."
                            />
                            {search && (
                                <button
                                    type="button"
                                    aria-label="Borrar búsqueda"
                                    onClick={() => setSearch('')}
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </label>
                        <button
                            type="button"
                            className="button button--primary movie-create-button"
                            onClick={createMovie}
                        >
                            <Plus size={14} />
                            Nueva película
                        </button>
                        <span
                            className="header-icon"
                            role="img"
                            aria-label="Notificaciones"
                            title="No tienes notificaciones nuevas"
                        >
                            <Bell size={16} />
                            <span />
                        </span>
                        <span
                            className="profile-avatar"
                            role="img"
                            aria-label="Perfil de invitado"
                            title="Perfil de invitado"
                        >
                            N
                        </span>
                    </div>
                </header>

                <main id="inicio">
                    <section className="hero" aria-labelledby="hero-title">
                        <img className="hero__image" src={hero.image} alt="" />
                        <div className="hero__veil" />
                        <div className="hero__content">
                            <div className="hero__labels">
                                <span>
                                    <Sparkles size={11} /> Destacada de la
                                    semana
                                </span>
                                <span>Selección boutique</span>
                            </div>
                            <p className="eyebrow">
                                Una obra original de Nocturne Studio
                            </p>
                            <h1 id="hero-title">
                                {hero.title.split(':')[0]}
                                {hero.title.includes(':') && (
                                    <span>{`: ${hero.title.split(':').slice(1).join(':').trim()}`}</span>
                                )}
                            </h1>
                            <div className="hero__metadata">
                                {hero.score !== '—' && (
                                    <span className="hero__score">
                                        <Star size={12} fill="currentColor" />{' '}
                                        {hero.score}
                                    </span>
                                )}
                                <span>{hero.director}</span>
                                <span>{hero.year ?? '—'}</span>
                                <span>{hero.duration} min</span>
                                <span className="hero__age">{hero.rating}</span>
                                <span className="hero__quality">4K UHD</span>
                                <span className="hero__quality">
                                    Dolby Atmos
                                </span>
                            </div>
                            <p className="hero__summary">{hero.synopsis}</p>
                            <div className="hero__actions">
                                <button
                                    type="button"
                                    className="button button--primary"
                                    onClick={() => showMovieDetails(hero)}
                                >
                                    <Info size={14} /> Ver detalles
                                </button>
                                <button
                                    type="button"
                                    className="button button--secondary"
                                    onClick={() => toggleFavorite(hero.id)}
                                    aria-pressed={favorites.includes(hero.id)}
                                >
                                    {favorites.includes(hero.id) ? (
                                        <Check size={14} />
                                    ) : (
                                        <Plus size={14} />
                                    )}
                                    {favorites.includes(hero.id)
                                        ? 'En Mi lista'
                                        : 'Mi lista'}
                                </button>
                                <button
                                    type="button"
                                    className="button button--round"
                                    aria-label={`Más información sobre ${hero.title}`}
                                    onClick={() => showMovieDetails(hero)}
                                >
                                    <Info size={15} />
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="hero__next"
                            onClick={() => showMovieDetails(editorialMovies[1])}
                        >
                            <img src={editorialMovies[1].image} alt="" />
                            <span>
                                <small>Siguiente en selección</small>
                                <strong>{editorialMovies[1].title}</strong>
                                <small>
                                    Estreno boutique · {editorialMovies[1].year}
                                </small>
                            </span>
                            <ChevronRight size={15} />
                        </button>
                        <div
                            className="hero__pagination"
                            aria-label="Película destacada 1 de 4"
                        >
                            <span>01</span>
                            <i />
                            <span>04</span>
                        </div>
                    </section>

                    <div className="page-content">
                        <section
                            aria-labelledby="locations-title"
                            className="locations-section"
                            id="ubicaciones"
                        >
                            <div className="locations-section__heading">
                                <div>
                                    <p className="locations-section__eyebrow">
                                        Encuentra tu cine
                                    </p>
                                    <h2 id="locations-title">
                                        Ciudades y sucursales
                                    </h2>
                                    <p>
                                        Explora nuestras ubicaciones por
                                        departamento y ciudad.
                                    </p>
                                </div>
                                <div className="locations-section__filters">
                                    <label>
                                        <span>Departamento</span>
                                        <select
                                            value={selectedDepartment}
                                            onChange={(event) => {
                                                setSelectedDepartment(
                                                    event.target.value,
                                                );
                                                setSelectedCity('all');
                                            }}
                                        >
                                            <option value="all">
                                                Todos los departamentos
                                            </option>
                                            {ubicaciones.map((department) => (
                                                <option
                                                    key={department.id}
                                                    value={department.id}
                                                >
                                                    {department.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        <span>Ciudad</span>
                                        <select
                                            value={selectedCity}
                                            onChange={(event) =>
                                                setSelectedCity(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="all">
                                                Todas las ciudades
                                            </option>
                                            {availableCities.map((city) => (
                                                <option
                                                    key={city.id}
                                                    value={city.id}
                                                >
                                                    {city.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                            </div>
                            {visibleLocations.length > 0 ? (
                                <div className="location-groups">
                                    {visibleLocations.map((department) => (
                                        <div
                                            className="location-group"
                                            key={department.id}
                                        >
                                            <h3>
                                                <Map size={14} />
                                                {department.nombre}
                                            </h3>
                                            {department.ciudades.map(
                                                (city) => (
                                                    <div
                                                        className="location-city"
                                                        key={city.id}
                                                    >
                                                        <h4>
                                                            <MapPin size={13} />
                                                            {city.nombre}
                                                        </h4>
                                                        <div className="branch-grid">
                                                            {city.sucursales.map(
                                                                (branch) => (
                                                                    <article
                                                                        className="branch-card"
                                                                        key={branch.id}
                                                                    >
                                                                        <Building2
                                                                            aria-hidden="true"
                                                                            className="branch-card__icon"
                                                                            size={17}
                                                                        />
                                                                        <div>
                                                                            <h5>
                                                                                {
                                                                                    branch.nombre
                                                                                }
                                                                            </h5>
                                                                            <p>
                                                                                {
                                                                                    branch.direccion
                                                                                }
                                                                            </p>
                                                                            {branch.descripcion && (
                                                                                <p className="branch-card__description">
                                                                                    {
                                                                                        branch.descripcion
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </article>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="locations-empty">
                                    {ubicaciones.length === 0
                                        ? 'Aún no hay departamentos registrados para mostrar ubicaciones.'
                                        : 'No hay sucursales en la ubicación seleccionada.'}
                                </p>
                            )}
                        </section>

                        <section className="catalogue-section" id="tendencias">
                            <SectionHeading
                                title={
                                    showFavorites
                                        ? 'Mi lista'
                                        : 'Tendencias ahora'
                                }
                                subtitle={
                                    search
                                        ? `${matchingMovies.length} resultado${matchingMovies.length === 1 ? '' : 's'}`
                                        : 'Global Top 10'
                                }
                                onPrevious={() =>
                                    scrollCarousel(trendingRef, -1)
                                }
                                onNext={() => scrollCarousel(trendingRef, 1)}
                            />
                            <div className="genre-filter">
                                <label htmlFor="genre-filter">
                                    Explorar por género
                                </label>
                                <select
                                    id="genre-filter"
                                    value={genre}
                                    onChange={(event) =>
                                        setGenre(event.target.value)
                                    }
                                >
                                    <option>Todos los géneros</option>
                                    {genres.map((item) => (
                                        <option key={item}>{item}</option>
                                    ))}
                                </select>
                                {(search ||
                                    genre !== 'Todos los géneros' ||
                                    showFavorites) && (
                                    <button
                                        type="button"
                                        className="clear-filters"
                                        onClick={() => {
                                            setSearch('');
                                            setGenre('Todos los géneros');
                                            setShowFavorites(false);
                                        }}
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                            {trending.length > 0 ? (
                                <div className="movie-rail" ref={trendingRef}>
                                    {trending.map((movie) => (
                                        <MovieCard
                                            key={movie.id}
                                            movie={movie}
                                            favorite={favorites.includes(
                                                movie.id,
                                            )}
                                            onFavorite={toggleFavorite}
                                            onDetails={showMovieDetails}
                                            onEdit={editMovie}
                                            onDelete={deleteMovie}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    message={
                                        showFavorites && favorites.length === 0
                                            ? 'Tu lista está esperando su primera película.'
                                            : 'No encontramos películas con esos filtros.'
                                    }
                                    onReset={() => {
                                        setSearch('');
                                        setGenre('Todos los géneros');
                                        setShowFavorites(false);
                                    }}
                                />
                            )}
                        </section>

                        {atmosphere.length > 0 && (
                            <section className="catalogue-section">
                                <SectionHeading
                                    title="Una historia para cada noche"
                                    subtitle="Selección de la casa"
                                />
                                <div className="story-grid">
                                    {atmosphere.map((movie) => (
                                        <button
                                            type="button"
                                            className="story-card"
                                            key={movie.id}
                                            onClick={() =>
                                                showMovieDetails(movie)
                                            }
                                        >
                                            <img
                                                src={movie.image}
                                                alt=""
                                                loading="lazy"
                                            />
                                            <span className="story-card__shade" />
                                            <span className="story-card__play">
                                                <Info size={16} />
                                            </span>
                                            <span className="story-card__copy">
                                                <small>{movie.note}</small>
                                                <strong>{movie.title}</strong>
                                                <span>
                                                    {movie.year ?? '—'} <i>·</i>{' '}
                                                    {movie.genre} <i>·</i>{' '}
                                                    {movie.duration} min
                                                </span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {recommendations.length > 0 && (
                            <section className="catalogue-section">
                                <SectionHeading
                                    title="Recomendadas para ti"
                                    subtitle="Descubrimientos para tu próxima sesión"
                                    onPrevious={() =>
                                        scrollCarousel(recommendationRef, -1)
                                    }
                                    onNext={() =>
                                        scrollCarousel(recommendationRef, 1)
                                    }
                                />
                                <div
                                    className="movie-rail movie-rail--recommendations"
                                    ref={recommendationRef}
                                >
                                    {recommendations.map((movie) => (
                                        <MovieCard
                                            key={movie.id}
                                            movie={movie}
                                            favorite={favorites.includes(
                                                movie.id,
                                            )}
                                            onFavorite={toggleFavorite}
                                            onDetails={showMovieDetails}
                                            onEdit={editMovie}
                                            onDelete={deleteMovie}
                                            compact
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="editorial" id="colecciones">
                            <div className="editorial__heading">
                                <span className="eyebrow">
                                    <Sparkles size={12} /> Curaduría exclusiva
                                </span>
                                <h2>Joyas ocultas del cine independiente</h2>
                                <p>
                                    Obras maestras aclamadas en festivales
                                    internacionales, restauradas en alta
                                    definición y acompañadas por ensayos de
                                    críticos de la industria.
                                </p>
                            </div>
                            <div className="editorial__feature">
                                <img
                                    src={editorialMovies[12].image}
                                    alt=""
                                    loading="lazy"
                                />
                                <span className="editorial__feature-shade" />
                                <div className="editorial__feature-copy">
                                    <span className="editorial__laurel">
                                        León de Oro · Venecia 2023 <i /> Premio
                                        de la crítica
                                    </span>
                                    <h3>{editorialMovies[12].title}</h3>
                                    <p>
                                        Una meditación visual hipnótica sobre el
                                        aislamiento y el tiempo suspendido.
                                    </p>
                                    <div className="editorial__actions">
                                        <button
                                            type="button"
                                            className="button button--primary"
                                            onClick={() =>
                                                showMovieDetails(
                                                    editorialMovies[12],
                                                )
                                            }
                                        >
                                            <Info size={14} /> Ver detalles
                                        </button>
                                        <button
                                            type="button"
                                            className="button button--quiet"
                                            onClick={() =>
                                                showMovieDetails(
                                                    editorialMovies[12],
                                                )
                                            }
                                        >
                                            Más información{' '}
                                            <ArrowDownRight size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="editorial__honors">
                                {[editorialMovies[13], editorialMovies[14]].map(
                                    (movie) => (
                                        <button
                                            type="button"
                                            className="honor-card"
                                            key={movie.id}
                                            onClick={() =>
                                                showMovieDetails(movie)
                                            }
                                        >
                                            <img
                                                src={movie.image}
                                                alt=""
                                                loading="lazy"
                                            />
                                            <span>
                                                <small>{movie.note}</small>
                                                <strong>{movie.title}</strong>
                                                <em>{movie.synopsis}</em>
                                                <small>
                                                    {movie.duration} min{' '}
                                                    <i>·</i>{' '}
                                                    <b>
                                                        <Star
                                                            size={10}
                                                            fill="currentColor"
                                                        />{' '}
                                                        {movie.score} puntuación
                                                    </b>
                                                </small>
                                            </span>
                                        </button>
                                    ),
                                )}
                            </div>
                        </section>

                        <section className="catalogue-section collection-section">
                            <SectionHeading
                                title="Colecciones de autor"
                                subtitle="Filmografías completas con versiones restauradas y entrevistas inéditas"
                            />
                            <div className="collection-grid">
                                {collections.map((collection) => (
                                    <a
                                        className="collection-card"
                                        href="#tendencias"
                                        key={collection.title}
                                    >
                                        <img
                                            src={collection.image}
                                            alt=""
                                            loading="lazy"
                                        />
                                        <span className="collection-card__shade" />
                                        <span className="collection-card__copy">
                                            <small>{collection.tag}</small>
                                            <strong>{collection.title}</strong>
                                            <span>{collection.detail}</span>
                                            <em>
                                                Explorar universo{' '}
                                                <ChevronRight size={12} />
                                            </em>
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>

                <footer className="site-footer">
                    <div className="site-footer__brand">
                        <a href="#inicio" className="brand__name">
                            Nocturne
                        </a>
                        <span>Catppuccin Frappé</span>
                        <p>
                            Plataforma cinematográfica nocturna curada para
                            cinéfilos.
                        </p>
                    </div>
                    <nav aria-label="Enlaces del pie de página">
                        <a href="#colecciones">Acerca de</a>
                        <a href="#colecciones">Prensa</a>
                        <a href="#colecciones">Privacidad</a>
                        <a href="#colecciones">Términos</a>
                        <a href="#colecciones">Ayuda</a>
                    </nav>
                    <div className="site-footer__bottom">
                        <span>
                            © 2026 Nocturne Cinema. Todos los derechos
                            reservados.
                        </span>
                        <span>
                            Edición boutique <i /> 4K HDR <i /> Dolby Atmos
                        </span>
                    </div>
                </footer>
            </div>
            {selectedMovie && (
                <MovieDetails
                    movie={selectedMovie}
                    favorite={favorites.includes(selectedMovie.id)}
                    onFavorite={toggleFavorite}
                    onClose={() => setSelectedMovie(null)}
                />
            )}
            {movieFormOpen && (
                <MovieFormDialog
                    movie={editingMovie}
                    onClose={() => setMovieFormOpen(false)}
                />
            )}
        </>
    );
}

function EmptyState({
    message,
    onReset,
}: {
    message: string;
    onReset: () => void;
}) {
    return (
        <div className="empty-state">
            <Film size={24} />
            <p>{message}</p>
            <button type="button" onClick={onReset}>
                Ver todo el catálogo
            </button>
        </div>
    );
}

PeliculaIndex.layout = null;
