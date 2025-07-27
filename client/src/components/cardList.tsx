import { useGetCardsQuery } from '../api/cardsApi';
import classNames from 'classnames';

const CardList = () => {
    const { data: cards, isLoading, error } = useGetCardsQuery();

    const className = classNames('', {
        'skeleton': isLoading || error || !cards
    });

    return (
        <div className={className}>
            <ul>
                {cards?.map((card) => (
                    <li key={`${card.Code}|${card.version}`}>{card.name} {card.version} ({card._id})</li>
                ))}
            </ul>
        </div>
    )
}

export default CardList;