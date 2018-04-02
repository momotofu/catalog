from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine


class Item(Base):
    __tablename__ = 'item'

    # attributes
    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    details = Column(String(400))
    price = Column(Integer(20))
    picture = Column(String(200))

    # relationships
    author = relationship(User)
    category = relationship(Category)


engine = create_engine('')
Base.metadata.create_all(engine)
